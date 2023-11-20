<?PHP
require_once("../site/include/fg_membersite.php");

$fgmembersite = new FGMembersite();

//Provide your site name here
$fgmembersite->SetWebsiteName('ja-ron.c1.biz');

//Provide the email address where you want to get notifications
$fgmembersite->SetAdminEmail('jaronwilson2024@gmail.com');

//Provide your database login details here:
//hostname, user name, password, database name and table name
//note that the script will create the table (for example, fgusers in this case)
//by itself on submitting register.php for the first time
$fgmembersite->InitDB(/*hostname*/'fdb31.biz.nf',
                      /*username*/'4004725_jaron',
                      /*password*/'6Zc@zChv3erdgL@',
                      /*database name*/'4004725_jaron',
                      /*table name*/'Users');

//For better security. Get a random string from this link: http://tinyurl.com/randstr
// and put it here
$fgmembersite->SetRandomKey('0iQx5oBk66oVZep');

?>