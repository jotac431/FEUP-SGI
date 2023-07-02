# SGI 2022/2023

## Group T02G06
| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Jorge Costa         | 201706518 | up201706518@fe.up.pt                |
| João Costa         | 201907355 | up201907355@fe.up.pt             |

----

## Projects

### [TP1 - Scene Graph](tp1)

  - The scene we created is called "Metropolis" and it represents a city, with buildings, roads, monuments and boats. We made sure to implement multiple cameras, to view the scene in a normal perspective camera, in multiple orthogonal angles and in some more "artistic" viewpoints. The textures and materials were set in a way that, by clicking M, first we see just a mainly grayscale representation of the scene, then the buildings grouped by color (prism buildings in red, special buildings in purple and so on) and then just random colors on the buildings. One can immediatly see the inheritance of materials and textures in the buildings. Most buildings are composed of simple primitives for the sake of simplicity but we also created the boats which represent more complex components, just to show that our engine can perfectly handle transformation, material and texture inheritance.
  - Here are some screenshots of the scene:
    - [Normal Perspective Camera](tp1/screenshots/perspective_camera_initial.png)
    - [Rooftop View](tp1/screenshots/rooftop_view.png)
    - [Top View Orthogonal Camera](tp1/screenshots/orthogonal_camera.png)
    - [Isometric Camera](tp1/screenshots/isometric_view.png)
    - [Complete folder](tp1/screenshots)
----

### [TP2 - NURBS, Shaders and Animations](tp2)
  - We implemented and modified some objects of the scene with NURBS: rooftops, floor, roads, pillars, etc. We also used shaders to make an effect of pulse on some objects of the scene. With animations, we made a train moving around the city. Also made some visual changes on scene to make it more immersive like adding a background. Lastly we fixed bugs of updating textures and added lights options.
  - Here are some screenshots of the scene:
    - [Normal Perspective Camera](tp2/screenshots/tp2_perspective.png)
    - [Side View](tp2/screenshots/tp2_bridge.png)
    - [Barrel Building](tp2/screenshots/tp2_barrel.png)
    - [Rooftops](tp2/screenshots/tp2_rooftop.png)
    - [Pulsings](tp2/screenshots/tp2_pulsing.png)
    - [Sun Light](tp2/screenshots/tp2_sunlight.png)
----

### [TP3 - Checkers 3D](tp3)
  - We builded the game Checkers. 
  - We created a game structure with models of the board and pieces, and controllers to respect game rules and animations.
  - Created a loittering camera, and we can select between xml files to choose different ambients.
  - Here are some screenshots of the scene:
    - [Menu](tp3/screenshots/tp3_menu.png)
    - [Wood Ambient 1](tp3/screenshots/tp3_wood1.png)
    - [Wood Ambient 1](tp3/screenshots/tp3_wood2.png)
    - [City Ambient](tp3/screenshots/tp3_city.png)
    - [Mars Ambient](tp3/screenshots/tp3_mars.png)
    - [King](tp3/screenshots/tp3_dama.png)

