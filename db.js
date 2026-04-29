(function() {
  const { createClient } = supabase;
  window.SLDb = createClient(
    'https://mwpscytkzjtkqjjqytqu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13cHNjeXRremp0a3FqanF5dHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjE0MDcsImV4cCI6MjA5Mjk5NzQwN30.v88eFZHANkxISbPe3_8p5KgbF-wh9q9rybyKF0wuS9I'
  );
})();
