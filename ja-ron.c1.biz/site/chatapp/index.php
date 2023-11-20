<?php

session_start();
 
if(isset($_GET['logout'])){    
     
    //Simple exit message
    $logout_message = "<div class='msgln'><span class='left-info'>User <b class='user-name-left'>". $_SESSION['name'] ."</b> has left the chat session.</span><br></div>";
    file_put_contents("log.html", $logout_message, FILE_APPEND | LOCK_EX);
     
    session_destroy();
    header("Location: index.php"); //Redirect the user
}

if(isset($_POST['name'])){
     
    //Simple join/reload message
    $login_message = "<div class='msgln'><span class='left-info'>". $_POST['name'] ."</b> has joined/reloaded the chat session.</span><br></div>";
    file_put_contents("log.html", $login_message, FILE_APPEND | LOCK_EX);
}

    if($_POST['name'] != ""){
        $_SESSION['name'] = stripslashes(htmlspecialchars($_POST['name']));
    }
    else{
        echo '<span class="error">Please type in a name</span>';
    }
 
function loginForm(){
    echo
    '<div id="loginform">
    <p>Please enter your name to continue!</p>
    <form action="index.php" method="post">
    <script>alert("Please put in your name to chat with others!")</script>
      <label for="name">Name &mdash;</label>
      <input type="text" name="name" id="name" />
      <input type="submit" name="enter" id="enter" value="Enter" />
    </form>
  </div>';
}
 
?>
 
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="utf-8" />
 
        <title>Chat time</title>
        <meta name="description" content="Jarons application" />
        <link rel="stylesheet" href="./css/styles.css">
        
   <link href="caption-gallery.css" rel="stylesheet">
    </head>
    
  <body>
    <matrix></matrix>
    <script src="./js/matrixrain_js.js"></script>
    
    
    <?php 
   
    if(!isset($_SESSION['name'])){
        loginForm();
     
    }
    else {
    ?>
    
    <dav>
    <div id="wrapper">
            <div id="menu">
                <p class="welcome">Welcome, <b><?php echo $_SESSION['name']; ?></b></p>
                <p class="welcome">If you are in Virgina it is 5 hours ahead!</p><br>
                <p class="logout"><a id="exit" href="#">Exit Chat</a></p>
            </div>
 
            <div id="chatbox">
            <?php
            if(file_exists("log.html") && filesize("log.html") > 0){
                $contents = file_get_contents("log.html");          
                echo $contents;
            }
            ?>
            </div>
 
            <form name="message" action="">
                <input name="usermsg" type="text" id="usermsg" />
                <input name="submitmsg" type="submit" id="submitmsg" value="Send" />
                <p class="" id="clock"></p>

<script>
setInterval(myTimer, 1000);

function myTimer() {
  const d = new Date();
  document.getElementById("clock").innerHTML = d.toLocaleTimeString();
}
</script>
            </form>
       
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script type="text/javascript">
            // jQuery Document
            $(document).ready(function () {
                $("#submitmsg").click(function () {
                    var clientmsg = $("#usermsg").val();
                    $.post("post.php", { text: clientmsg });
                    $("#usermsg").val("");
                    return false;
                });
 
                function loadLog() {
                    var oldscrollHeight = $("#chatbox")[0].scrollHeight - 20; //Scroll height before the request
 
                    $.ajax({
                        url: "log.html",
                        cache: false,
                        success: function (html) {
                            $("#chatbox").html(html); //Insert chat log into the #chatbox div
 
                            //Auto-scroll           
                            var newscrollHeight = $("#chatbox")[0].scrollHeight - 20; //Scroll height after the request
                            if(newscrollHeight > oldscrollHeight){
                                $("#chatbox").animate({ scrollTop: newscrollHeight }, 'normal'); //Autoscroll to bottom of div
                            }   
                        }
                    });
                }
 
                setInterval (loadLog, 1000);
 
                $("#exit").click(function () {
                    var exit = confirm("Are you sure you want to end the session?");
                    if (exit == true) {
                    window.location = "index.php?logout=true";
                    }
                });
            });
        </script>
        </dav>

<form class="" action="index.php" method="post" enctype="multipart/form-data">
  Select image to upload:
  <input type="file" name="fileToUpload" id="fileToUpload">
  <input type="submit" value="Upload Image" name="submit">
</form>
    </body>
</html>
<?php
$target_dir = "../chatapp/gallerys/gallery/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);

$file = $_FILES["fileToUpload"]["name"];
$new_name = $_FILES["fileName"] . "_" . $file;

$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
  $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
  if($check !== false) {
    echo "<p>File is an image - " . $check["mime"] . ". </p>";
    $uploadOk = 1;
  } else {
    echo "<p>File is not an image.</p>";
    $uploadOk = 0;
  }
}else

// Check if file already exists
if (file_exists($target_file)) {
  echo "<p>Sorry, file already exists.</p>";
  $uploadOk = 0;
}

// Check file size
if ($_FILES["fileToUpload"]["size"] > 500000) {
  echo "<p>Sorry, your file is too large.</p>";
  $uploadOk = 0;
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif") {
  echo "<p>Sorry, only JPG, JPEG, PNG & GIF files are allowed. For now!</p>";
  $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  echo "<p>Sorry, your file was not uploaded.</p>";
// if everything is ok, try to upload file
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    echo "<p> The file ". htmlspecialchars( basename( $_FILES["fileName"]["name"])). " has been uploaded. </p>";
  } else {
    echo "<p>Sorry, there was an error uploading your file.</p>";
  }
}
?>
<?php
}
?>