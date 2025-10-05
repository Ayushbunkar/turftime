// Quick test file to verify imports are working correctly
// This file can be deleted after testing

// Test API import
import api from './client/src/lib/api.js';
console.log('✅ API import successful:', typeof api);

// Test superAdminService import
import superAdminService from './client/src/services/superAdminService.js';
console.log('✅ SuperAdminService import successful:', typeof superAdminService);

// Test methods exist
console.log('✅ getDashboardStats method exists:', typeof superAdminService.getDashboardStats === 'function');
console.log('✅ formatCurrency method exists:', typeof superAdminService.formatCurrency === 'function');

console.log('🎉 All imports working correctly!');