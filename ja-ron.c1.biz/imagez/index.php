<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="utf-8" />
 
        <title>Chat time</title>
        <meta name="description" content="Jarons application" />
</head>
    
  <body>

<input type="file" onchange="onFileSelected(event)">
<img id="myimage" height="200">

<script>
function onFileSelected(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("myimage");
  imgtag.title = selectedFile.name;

  reader.onload = function(event) {
    imgtag.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
}
</script>

</body>
</html>