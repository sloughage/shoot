# shoot
WASD(move)
SPACE(fire)
P(ause)

Basic shmup written in vanilla js.
Objective was to build a game loop with multiple states, allow the player to control a unit, have entities made up of other entities, and have entities with state-based behavior. Circles were used for ease of rendering and collision detection. Only the Overlap and Draw functions would have to be adjusted. Lack of class inheritance led to redundant code. If the game were to be expanded, inheritance workarounds should be implemented to remove redundancies and a "Unit" super-class would lead to fewer, but more flexible classes. For consistancy, some form of raycasting for bullets should be implemented to prevent fast bullets from passing through edges of objects.
