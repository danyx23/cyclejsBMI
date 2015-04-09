cylcebmi
=======

simple body mass index calculator built with cylcejs. This is a simple
example that mirrors @lefant's [purescript](https://github.com/lefant/purebmi/) and [react + omniscient](https://github.com/lefant/omnibmi/) versions
of the same bmi calculator, but with cyclejs instead of react.

This branch is built against the stream branch of cycle, and as such you can't use npm currently to build it but need to
check out the stream branch of cycle into a directory next to the cyclejsBMI directory (relative path is hardcoded in
index.html)

demo url:
http://danielbachler.de/files/cyclejsBMI/index.html

learn more about the BMI on wikipedia:
http://en.wikipedia.org/wiki/Body_mass_index

----

to assemble the code:

  npm install
  webpack

  (+ checkout cycle js stream branch as described above)
