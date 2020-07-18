import { testFizzbuzz } from './test-fizzbuzz.mjs';
import { testFindmax } from './test-findmax.mjs';

process.env.NODE_ENV = 'test';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Required when getting UNABLE_TO_VERIFY_LEAF_SIGNATURE error.

testFizzbuzz();
// testFindmax();
