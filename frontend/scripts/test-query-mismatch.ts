import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueryMismatch() {
  const projectId = '92424dd1-6de1-4646-918d-e526476cacd9';
  const creatorId = '618e3c93-dd04-49c7-9d5a-85131e42cd3a';

  console.log('=== TESTING QUERY MISMATCH ===\n');

  // EXACT LIST QUERY (from creator dashboard)
  console.log('1. LIST QUERY (creator dashboard):');
  console.log(`   WHERE creator_id = ${creatorId}`);
  const listResult = await prisma.project.findMany({
    where: { creatorId: creatorId },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`   Result: ${listResult.length} projects found`);
  console.log(`   ${listResult.length > 0 ? '✅ WORKS' : '❌ FAILS'}\n`);

  // EXACT SINGLE QUERY (from view page) - STEP 1: Find by ID
  console.log('2. SINGLE QUERY - Step 1 (find by ID):');
  console.log(`   WHERE id = ${projectId}`);
  const singleResult = await prisma.project.findUnique({
    where: { id: projectId },
  });
  console.log(`   Result: ${singleResult ? 'Found' : 'Not found'}`);
  console.log(`   ${singleResult ? '✅ WORKS' : '❌ FAILS'}\n`);

  // EXACT SINGLE QUERY - STEP 2: Check access
  console.log('3. SINGLE QUERY - Step 2 (check access):');
  if (singleResult) {
    console.log(`   Is primary creator: ${singleResult.creatorId === creatorId}`);
    
    const collaborator = await prisma.projectCollaborator.findFirst({
      where: {
        projectId,
        creatorId,
      },
    });
    console.log(`   Is collaborator: ${!!collaborator}`);
    
    const hasAccess = singleResult.creatorId === creatorId || !!collaborator;
    console.log(`   Has access: ${hasAccess ? '✅ YES' : '❌ NO'}\n`);

    if (!hasAccess) {
      console.log('🔥 FOUND THE BUG: Access check fails even though creator owns the project!\n');
    }
  } else {
    console.log('   ❌ Cannot check access - project not found in step 1\n');
  }

  // Check for type mismatches
  console.log('4. TYPE VERIFICATION:');
  const typeCheck = await prisma.$queryRaw<any[]>`
    SELECT 
      pg_typeof(id)::text as id_type,
      pg_typeof(creator_id)::text as creator_id_type,
      id = ${projectId}::uuid as id_matches,
      creator_id = ${creatorId}::uuid as creator_matches
    FROM projects
    WHERE id = ${projectId}::uuid
  `;
  
  if (typeCheck.length > 0) {
    console.log(`   ID type: ${typeCheck[0].id_type}`);
    console.log(`   Creator ID type: ${typeCheck[0].creator_id_type}`);
    console.log(`   ID comparison works: ${typeCheck[0].id_matches ? '✅' : '❌'}`);
    console.log(`   Creator ID comparison works: ${typeCheck[0].creator_matches ? '✅' : '❌'}\n`);
  }

  // Simulate the EXACT difference
  console.log('5. QUERY COMPARISON:');
  
  // What the list uses
  const listStyle = await prisma.project.findFirst({
    where: { 
      id: projectId,
      creatorId: creatorId 
    },
  });
  console.log(`   List-style query (id + creatorId): ${listStyle ? '✅ Found' : '❌ Not found'}`);

  // What the single view uses (just ID, then checks access separately)
  const viewStyle = await prisma.project.findUnique({
    where: { id: projectId },
  });
  const viewHasAccess = viewStyle && viewStyle.creatorId === creatorId;
  console.log(`   View-style query (id only, then check): ${viewHasAccess ? '✅ Found + access' : '❌ Failed'}`);

  console.log('\n=== DIAGNOSIS ===');
  if (listResult.length > 0 && singleResult && viewHasAccess) {
    console.log('✅ NO QUERY MISMATCH - Both queries work correctly');
    console.log('   The issue was likely the JSON parsing crash I fixed earlier.');
  } else if (listResult.length > 0 && !viewHasAccess) {
    console.log('🔥 QUERY MISMATCH CONFIRMED');
    console.log('   List works but single view fails access check');
  } else {
    console.log('⚠️  Unexpected state - need further investigation');
  }

  await prisma.$disconnect();
}

testQueryMismatch().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
