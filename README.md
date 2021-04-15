# Boids
Created with CodeSandbox

The boid concept is based on Craig Reynolds http://www.red3d.com/cwr/boids/ and the boid implementation by Ben Eater https://eater.net/boids.

The boids four algorithms to determine velocity are:
Separation: steer to avoid crowding local flockmates
Alignment: steer towards the average heading of local flockmates
Cohesion: steer to move toward the average position of local flockmates
Avoidance: steer to avoid preditors

The boids two algorithms to determine velocity are:
Attack: steer towards closest boid
Separation: steer to avoid crowding local preditors

If the preditors get too close to the boid it will "eat" the boid and the boid will be destroyed.
If the number of boids falls below 200 it will refresh the boids too 1000

Three of the values for the algorithm to determine priority of the boids between alignment, cohesion and avoidance.
These random values determine the colour of the boids.
The random values are shared by "packs", at the moment they are size 8.
Todo: add code so the next generation is affect based on the ratios of how many in a pack survived.
