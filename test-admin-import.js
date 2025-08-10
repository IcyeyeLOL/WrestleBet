// Test admin component imports
console.log('Testing admin component imports...');

try {
  const AdminMatchControl = require('./app/components/AdminMatchControl.jsx');
  console.log('AdminMatchControl type:', typeof AdminMatchControl);
  console.log('AdminMatchControl default:', typeof AdminMatchControl.default);
  console.log('AdminMatchControl object keys:', Object.keys(AdminMatchControl));
} catch (error) {
  console.error('AdminMatchControl import error:', error.message);
}

try {
  const AdminAnalytics = require('./app/components/AdminAnalytics.jsx');
  console.log('AdminAnalytics type:', typeof AdminAnalytics);
  console.log('AdminAnalytics default:', typeof AdminAnalytics.default);
} catch (error) {
  console.error('AdminAnalytics import error:', error.message);
}
