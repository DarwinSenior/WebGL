This the MP3 for CS418.

This MP is written in webgl with the help of library [glMatrix.js][1].
In order to run the program, one needs to open a web browser with support of Webgl. I used Chrome as an example, however, file access is somewhat restricted for security reason. One needs to set up a server to run locally. The easiest way to do so is to use `python -m SimpleHTTPServer` or if you prefer, node.js. And open in browser.

+ There are few parameter that one can choose to set up different light effect, and please press submit button to see the actual effect. The light technique I am using is directional light rather than pointed light, and also ambient light, since I feel it has fewer parameter but achieves the same effect.
+ The environment mapping and the texture mapping are colliding with each other, and I feel 7:3 is a reasonable proportion and can be edited in fragmentshader.
+ To move around the teapot, one should use 4 arrow keys to control the speed of rotation. Since the center is not around the teapot, one would expect position changing during the rotation.
+ The video is recorded on the [youtube](https://www.youtube.com/watch?v=H9CVToBvJoA&list=UULZm0I_eiqvAPHrX1w7hmdA).
+ I used python to convert the original obj file to json script

[1]: http://glmatrix.net