import { supabase } from '@/lib/supabase';
import { MOCK_CHANNELS } from '../utils/mock';
import { Channel } from '../types';

/**
 * Synchronizes local mock channels to the Supabase 'Channel' table.
 * - Updates existing channels if the ID matches.
 * - Inserts new channels if the ID is not found.
 */
export async function syncChannels(channels: Channel[] = MOCK_CHANNELS) {
  console.log('🚀 Starting channel synchronization...');
  
  for (const channel of channels) {
    try {
      // Check if channel exists
      const { data, error } = await supabase
        .from('Channel')
        .select('id')
        .eq('id', channel.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
        console.error(`❌ Error fetching channel ${channel.id}:`, error);
        continue;
      }

      if (data) {
        // Update existing channel
        const { error: updateError } = await supabase
          .from('Channel')
          .update(channel)
          .eq('id', channel.id);

        if (updateError) {
          console.error(`❌ Failed to update channel ${channel.name}:`, updateError);
        } else {
          console.log(`✅ Channel updated: ${channel.name}`);
        }
      } else {
        // Insert new channel
        const { error: insertError } = await supabase
          .from('Channel')
          .insert(channel);

        if (insertError) {
          console.error(`❌ Failed to insert channel ${channel.name}:`, insertError);
        } else {
          console.log(`➕ Channel inserted: ${channel.name}`);
        }
      }
    } catch (e) {
      console.error(`Unexpected error syncing channel ${channel.id}:`, e);
    }
  }
  
  console.log('🎯 Channel sync complete!');
}

/**
 * Manual sync trigger for development/admin use.
 */
export async function runManualSync() {
  await syncChannels();
}
