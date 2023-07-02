# SGI 2022/2023 - TP1

## Group T02G06
| Name             | Number    | E-Mail             |
| ---------------- | --------- | ------------------ |
| Jorge Costa         | 201706518 | up201706518@fe.up.pt                |
| João Costa         | 201907355 | up201907355@fe.up.pt             |

----
## Project information

- (items describing main strong points)
- Scene
  - The scene we created is called "Metropolis" and it represents a city, with buildings, roads, monuments and boats. We made sure to implement multiple cameras, to view the scene in a normal perspective camera, in multiple orthogonal angles and in some more "artistic" viewpoints. The textures and materials were set in a way that, by clicking M, first we see just a mainly grayscale representation of the scene, then the buildings grouped by color (prism buildings in red, special buildings in purple and so on) and then just random colors on the buildings. One can immediatly see the inheritance of materials and textures in the buildings. Most buildings are composed of simple primitives for the sake of simplicity but we also created the boats which represent more complex components, just to show that our engine can perfectly handle transformation, material and texture inheritance.
  - Here are some screenshots of the scene:
    - [Normal Perspective Camera](screenshots/perspective_camera_initial.png)
    - [Rooftop View](screenshots/rooftop_view.png)
    - [Top View Orthogonal Camera](screenshots/orthogonal_camera.png)
    - [Isometric Camera](screenshots/isometric_view.png)
    - [Complete folder](screenshots)
----
## Issues/Problems

- Lights are not properly working
- Textures are applied but the "lengh_t and length_s" mechanic is not implemented
