"use client";

import AdminMatchControl from './app/components/AdminMatchControl';
import AdminAnalytics from './app/components/AdminAnalytics';

export default function TestAdmin() {
  console.log('AdminMatchControl:', AdminMatchControl);
  console.log('AdminAnalytics:', AdminAnalytics);
  
  return (
    <div>
      <h1>Testing Admin Components</h1>
      <div>AdminMatchControl type: {typeof AdminMatchControl}</div>
      <div>AdminAnalytics type: {typeof AdminAnalytics}</div>
      <AdminMatchControl />
    </div>
  );
}
