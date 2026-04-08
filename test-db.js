const mysql = require('mysql2');
const connection = mysql.createConnection('mysql://root:@127.0.0.1:3306/studycubs_lms');
connection.connect(err => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connection successful!');
    connection.end();
    process.exit(0);
  }
});
