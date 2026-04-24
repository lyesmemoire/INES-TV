import { FeedOrchestrator } from './server/core/FeedOrchestrator';

async function testFeed() {
    console.log('🚀 [RUNTIME_TEST] Starting FeedOrchestrator.buildHomeFeed()...');
    const start = Date.now();
    
    try {
        const layout = await FeedOrchestrator.buildHomeFeed('USER');
        const duration = Date.now() - start;
        
        console.log(`✅ [SUCCESS] Feed generated in ${duration}ms`);
        console.log(`📦 [RESULT] ${layout.items.length} items found.`);
        
        // Check for any specific item structure issues
        if (layout.items.length > 0) {
            console.log('🔍 [SAMPLE] First item type:', layout.items[0].type);
        }
        
    } catch (error: any) {
        console.error('❌ [CRASH] FeedOrchestrator failed!');
        console.error('--- STACK TRACE ---');
        console.error(error.stack || error.message);
        
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
    }
}

testFeed().then(() => process.exit(0));
