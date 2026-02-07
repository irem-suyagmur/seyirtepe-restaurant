<?php
// Session'ı başlat ve sonlandır
session_start();
session_destroy();

// Login sayfasına yönlendir
header('Location: login.php');
exit();
