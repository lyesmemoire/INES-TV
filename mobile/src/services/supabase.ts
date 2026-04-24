import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mwlrfygdnrcgzlzyvmqv.supabase.co';
const supabaseAnonKey = 'sb_publishable__LyFCF0pH6EqQ6dT4orc9A_mrzUuke4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
