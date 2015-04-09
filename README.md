cylcebmi
=======

simple body mass index calculator built with cylcejs. This is a simple
example that mirrors @lefant's [purescript](https://github.com/lefant/purebmi/) and [react + omniscient](https://github.com/lefant/omnibmi/) versions
of the same bmi calculator, but with cyclejs instead of react.

demo url:
http://danielbachler.de/files/cyclejsBMI/index.html

learn more about the BMI on wikipedia:
http://en.wikipedia.org/wiki/Body_mass_index

----

to assemble the code:
```
  npm install
  webpack
```
At the time of writing the stream branch of cycle does not have a lib directory, so you need to build it:
```
  cd node_modules/cyclejs
  npm run compile-lib
```