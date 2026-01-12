import { NextRequest } from "next/server";
import { error, success } from "@/lib/server/response";
import { authenticateCreator } from "@/lib/server/creatorAuth";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  default_branch: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
}

interface PullDetailsResponse {
  title: string;
  description: string;
  techStack: string[];
  externalLink: string;
  version?: string;
  lastUpdated: string;
}

// Validate URL format
function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Extract GitHub owner and repo from URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes("github.com")) return null;

    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    return {
      owner: parts[0],
      repo: parts[1].replace(".git", ""),
    };
  } catch {
    return null;
  }
}

// Fetch GitHub repo data
async function fetchGitHubData(
  owner: string,
  repo: string
): Promise<PullDetailsResponse> {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const timeout = 7000; // 7 second timeout

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch repo metadata
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers, signal: controller.signal }
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error("Repository not found or is private");
      }
      if (repoResponse.status === 403) {
        throw new Error("GitHub API rate limit exceeded. Try again later.");
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData: GitHubRepo = await repoResponse.json();

    // Fetch languages
    let techStack: string[] = [];
    try {
      const langResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        { headers, signal: controller.signal }
      );

      if (langResponse.ok) {
        const languages = await langResponse.json();
        techStack = Object.keys(languages);
      }
    } catch (err) {
      // Non-critical, continue without languages
      console.log("Could not fetch languages:", err);
    }

    // Fetch latest release (optional)
    let version: string | undefined;
    try {
      const releaseResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        { headers, signal: controller.signal }
      );

      if (releaseResponse.ok) {
        const releaseData: GitHubRelease = await releaseResponse.json();
        version = releaseData.tag_name;
      }
    } catch (err) {
      // Non-critical, continue without version
      console.log("Could not fetch release:", err);
    }

    clearTimeout(timeoutId);

    return {
      title: repoData.name,
      description: repoData.description || "",
      techStack,
      externalLink: repoData.html_url,
      version,
      lastUpdated: repoData.updated_at,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw err;
    }
    throw new Error("Failed to fetch GitHub data");
  }
}

// Fetch generic webpage metadata (limited)
async function fetchGenericData(url: string): Promise<PullDetailsResponse> {
  const timeout = 5000; // 5 second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    clearTimeout(timeoutId);

    // Extract title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract meta description
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
    );
    const description = descMatch ? descMatch[1].trim() : "";

    return {
      title,
      description,
      techStack: [],
      externalLink: url,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw err;
    }
    throw new Error("Failed to fetch webpage data");
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify creator authentication
    const creatorData = await authenticateCreator(req);
    if (!creatorData || !creatorData.creatorId) {
      return error("Unauthorized", 401);
    }

    const body = await req.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== "string") {
      return error("URL is required", 400);
    }

    if (!isValidHttpUrl(url)) {
      return error("Invalid URL format", 400);
    }

    // Detect source
    let data: PullDetailsResponse;

    if (url.includes("github.com")) {
      // GitHub source
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return error("Invalid GitHub URL format", 400);
      }

      try {
        data = await fetchGitHubData(parsed.owner, parsed.repo);
      } catch (err) {
        if (err instanceof Error) {
          return error(err.message, 400);
        }
        return error("Failed to fetch GitHub data", 500);
      }
    } else {
      // Generic webpage
      try {
        data = await fetchGenericData(url);
      } catch (err) {
        if (err instanceof Error) {
          return error(err.message, 400);
        }
        return error("Failed to fetch webpage data", 500);
      }
    }

    return success(data);
  } catch (err) {
    console.error("Pull project error:", err);
    return error("Internal server error", 500);
  }
}
