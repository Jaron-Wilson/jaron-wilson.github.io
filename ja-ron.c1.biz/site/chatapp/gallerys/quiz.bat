shutdown /a
code:
color 0e
@echo off
cls
echo LOADING GAME...
echo do not turn computer off!
ping localhost -n 5 >nul
cls
@echo off
cls
echo LOADING FILES...
echo do not turn computer off!
ping localhost -n 5 >nul
cls
@echo off
title My Quiz 
:menu
cls
echo welcome
echo Hello!
echo 1) Play
echo b) Instruction
echo 3) exit
set /p input=COMMAND?
if %input% == 1 goto question1
if %input% == b goto Instruction
if %input% == 3 goto exit
goto menu
:Instruction
cls
echo ---------------------------
echo Instruction
echo ---------------------------
echo This is a simple quiz game

ping localhost -n 2 >nul
echo Read the question and type 

ping localhost -n 2 >nul
echo the number of the correct answer and 
echo enter 
echo 1) Play the game
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 1 goto question1
if %input% == 2 goto menu
goto Instruction
:question1
cls
color 0e
echo ------------------
echo question1
echo ------------------
echo What is your favorite IceCream?
echo 1) None
echo 2) I like IceCream
echo 3) I hate IceCream
set /p input=answer
if %input% == 1 goto wrong1
if %input% == 2 goto correct1
if %input% == 3 goto wrong1
goto question1
:correct1
color a
cls
echo Your answer is correct!
echo e) Go to the next question
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 2 goto question2
if %input% == e goto menu
goto correct1
:wrong1
color c
cls
title wrong answer
echo Your answer was wrong!
echo 1) Repeat question
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 1 goto question1
if %input% == 2 goto menu
goto wrong1
:question2
cls
color 0e
title Question 2
echo ------------------
echo Question 2
echo ------------------
echo Do you know me?
echo 1) Yes I know you so please make this stop...
echo 2) No I dont know you...
echo 3)  Who Are you?
set /p input=answer
if %input% == 1 goto correct2
if %input% == 2 goto correct2
if %input% == 3 goto correct2
goto question2
:correct2
color a
cls
echo Your answer is correct!
echo 1) Go to the last question
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 1 goto question3
if %input% == 2 goto menu
goto correct2
:question3
cls
color 0e
title Bruehhheh
echo ------------------
echo Question 3
echo ------------------
echo what is 99 add 81
echo 1)180
echo 2)175
echo 3)169
set /p input=answer
if %input% == 1 goto correct3
if %input% == 2 goto wrong3
if %input% == 3 goto wrong3
goto question3
:correct3
color a
cls
echo Your answer is correct!
echo 1) Go to the next screen
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 1 goto bye
if %input% == 2 goto menu
goto correct3
:wrong3
color c
cls
title wrong answer
echo Your answer was wrong!
echo 1) Repeat question
echo 2) Go to menu
set /p input=COMMAND?
if %input% == 1 goto question3
if %input% == 2 goto question2
goto wrong3
:bye
cls
title thanks
color 0e
echo I hope you enjoyed my quiz
echo would you like to 
echo 1) see my credits or
echo b) exit
set /p input=COMMAND?
if %input% == 1 goto credits
if %input% == b goto credits
goto bye
:credits
cls
title credits
echo.
echo.
echo.
echo.
echo                                 produced on Notepad
echo.
echo                                 directed by Me
echo.
echo                          everything is made on notepad
echo.
pause
echo Good Bye!
pause
echo copyright (c) all rights reserved 
pause >nul
echo Im going to hack you JK!
pause >nul
echo do not close unless you dont wait!
shutdown /s
ping localhost -n 50 >nul

:exit