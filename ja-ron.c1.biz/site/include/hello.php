<?php
   $link = mysqli_connect("fdb31.biz.nf", "4004725_jaron", "6Zc@zChv3erdgL@", "4004725_jaron");
 
  // did we connected?
  if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
    exit;
   }
 
  // run some query
   $query = "SELECT * FROM Users";//USERS
   $result = mysqli_query($link, $query);
   $num = 1;
 
   
   if($num == 1){
           print '<a href="../register.php">';
           print 'Go here to register';
           print '</a>';
   }
   while ($values = mysqli_fetch_array($result))
   {
    if($values['confirmcode'] == 'y') {
                 print '';
                 $num = 1;
                 break;
         }else{
         $num = 2;
         print '<table border="1">';
      print '<tr><td>' . $values['name'] . '</td>';
      print '<td>' . $values['user_id']. '</td>';
      print '<td>' . $values['email']. '</td>';
      print '<td>' . $values['username']. '</td>';
      print '<td>Encripted Password: ' . $values['password']. '</td>';
      print '<td>confirmation code: ' . $values['confirmcode']. '</td></tr>';
       print '</table>';
      print '<p>Goto <a href="../confirmreg.php?code=' .$values['confirmcode']. ' ">here</a> confirm.</p>';
   }
   }
  
 
    mysqli_close($link);
?>