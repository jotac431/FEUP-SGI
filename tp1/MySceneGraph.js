import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';
import { MyRectangle } from './MyRectangle.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyComponent } from './MyComponent.js';
import { MyTorus } from './MyTorus.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

var MATERIAL_EMISSION_INDEX = 0;
var MATERIAL_AMBIENT_INDEX = 1;
var MATERIAL_DIFFUSE_INDEX = 2;
var MATERIAL_SPECULAR_INDEX = 3;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene,gui) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        this.scene.gui = gui
        scene.graph = this;

        this.nodes = [];
        this.views = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);

    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;
        var defaultCameraName = this.reader.getString(viewsNode,'default');
        if (defaultCameraName == null){
            return "No default camera defined"
        }
        this.views = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of cameras.
        for (var i = 0; i < children.length; i++) {

            //Check type of view
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current view.
            var viewID = this.reader.getString(children[i], 'id');
            if (viewID == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewID] != null)
                return "ID must be unique for each view (conflict: ID = " + viewID + ")";
            if (children[i].nodeName == "perspective") {
                var viewNear = this.reader.getFloat(children[i], 'near');
                if (viewNear == null) {
                    return "'near' not defined for camera " + viewID;
                }
                var viewFar = this.reader.getFloat(children[i], 'far');
                if (viewFar == null) {
                    return "'far' not defined for camera " + viewID;
                }
                var viewAngle = this.reader.getFloat(children[i], 'angle');
                if (viewAngle == null) {
                    return "'angle' not defined for camera " + viewID;
                }
                var nodeNames = [];
                for (var j = 0; j < children[i].children.length; j++) {
                    nodeNames.push(children[i].children[j].nodeName);
                }
                if (nodeNames.length != 2 || nodeNames.indexOf('from') == null || nodeNames.indexOf('to') == null) {
                    return "'from' or 'to' of view " + viewID + " are not defined"
                }
                var fromNode = children[i].children[nodeNames.indexOf('from')];
                var toNode = children[i].children[nodeNames.indexOf('to')];

                var fromX = this.reader.getFloat(fromNode, 'x');
                if (fromX == null) {
                    return "'x' not defined for view " + viewID + " in from";
                }

                var fromY = this.reader.getFloat(fromNode, 'y');
                if (fromY == null) {
                    return "'y' not defined for view " + viewID + " in from";
                }

                var fromZ = this.reader.getFloat(fromNode, 'z');
                if (fromZ == null) {
                    return "'z' not defined for view " + viewID + " in from";
                }

                var toX = this.reader.getFloat(toNode, 'x');
                if (toX == null) {
                    return "'x' not defined for view " + viewID + " in to";
                }

                var toY = this.reader.getFloat(toNode, 'y');
                if (toY == null) {
                    return "'y' not defined for view " + viewID + " in to";
                }

                var toZ = this.reader.getFloat(toNode, 'z');
                if (toZ == null) {
                    return "'z' not defined for view " + viewID + " in to";
                }
                var fromVec = vec3.fromValues(fromX, fromY, fromZ);
                var toVec = vec3.fromValues(toX, toY, toZ);
                var v = new CGFcamera(viewAngle, viewNear, viewFar, fromVec, toVec);
                this.views[viewID] = v;
            } else if (children[i].nodeName == "ortho") {
                var viewNear = this.reader.getFloat(children[i], 'near');
                if (viewNear == null) {
                    return "'near' not defined for camera " + viewID;
                }
                var viewFar = this.reader.getFloat(children[i], 'far');
                if (viewFar == null) {
                    return "'far' not defined for camera " + viewID;
                }
                var viewLeft = this.reader.getFloat(children[i], 'left');
                if (viewLeft == null) {
                    return "'left' not defined for camera " + viewID;
                }
                var viewRight = this.reader.getFloat(children[i], 'right');
                if (viewRight == null) {
                    return "'right' not defined for camera " + viewID;
                }
                var viewTop = this.reader.getFloat(children[i], 'top');
                if (viewTop == null) {
                    return "'top' not defined for camera " + viewID;
                }
                var viewBottom = this.reader.getFloat(children[i], 'bottom');
                if (viewBottom == null) {
                    return "'bottom' not defined for camera " + viewID;
                }
                var nodeNames = [];
                for (var j = 0; j < children[i].children.length; j++) {
                    nodeNames.push(children[i].children[j].nodeName);
                }
                if (nodeNames.length != 3 || nodeNames.indexOf('from') == -1 || nodeNames.indexOf('to') == -1 || nodeNames.indexOf('up') == -1) {
                    return "'from', 'to' or 'up of view " + viewID + " are not defined"
                }
                var fromNode = children[i].children[nodeNames.indexOf('from')];
                var toNode = children[i].children[nodeNames.indexOf('to')];
                var upNode = children[i].children[nodeNames.indexOf('up')];

                var fromX = this.reader.getFloat(fromNode, 'x');
                if (fromX == null) {
                    return "'x' not defined for view " + viewID + " in from";
                }

                var fromY = this.reader.getFloat(fromNode, 'y');
                if (fromY == null) {
                    return "'y' not defined for view " + viewID + " in from";
                }

                var fromZ = this.reader.getFloat(fromNode, 'z');
                if (fromZ == null) {
                    return "'z' not defined for view " + viewID + " in from";
                }

                var toX = this.reader.getFloat(toNode, 'x');
                if (toX == null) {
                    return "'x' not defined for view " + viewID + " in to";
                }

                var toY = this.reader.getFloat(toNode, 'y');
                if (toY == null) {
                    return "'y' not defined for view " + viewID + " in to";
                }

                var toZ = this.reader.getFloat(toNode, 'z');
                if (toZ == null) {
                    return "'z' not defined for view " + viewID + " in to";
                }

                var upX = this.reader.getFloat(upNode, 'x');
                if (upX == null) {
                    return "'x' not defined for view " + viewID + " in up";
                }

                var upY = this.reader.getFloat(upNode, 'y');
                if (upY == null) {
                    return "'y' not defined for view " + viewID + " in up";
                }

                var upZ = this.reader.getFloat(upNode, 'z');
                if (upZ == null) {
                    return "'z' not defined for view " + viewID + " in up";
                }
                var fromVec = vec3.fromValues(fromX, fromY, fromZ);
                var toVec = vec3.fromValues(toX, toY, toZ);
                var upVec = vec3.fromValues(upX, upY, upZ);
                var v = new CGFcameraOrtho(viewLeft, viewRight, viewBottom, viewTop, viewNear, viewFar, fromVec, toVec, upVec);
                this.views[viewID] = v;
            }
            
            grandChildren = children[i].children;
        }

        //Set the default camera
        var defaultCamera = this.views[defaultCameraName]
        if (defaultCamera == undefined){
            return 'camera refered by default does not exist'
        }
        this.scene.camera = defaultCamera
        this.scene.updateProjectionMatrix();
        this.scene.loadIdentity();
        this.scene.applyViewMatrix();
        this.scene.gui.setActiveCamera(defaultCamera)

        //The following code creates the selection box and populates it with the camera names
        var listValues = Object.keys(this.scene.graph.views);
        // object containing an attribute that holds the selected value label
        // in the next line we consider this to hold an attribute called selection
        this.selectedCamera = listValues[0]
        // in the next command we add a list of values based on a) an array of strings ()listValues
        // and b) the object that holds the selection (someObject.selection)
        // .name and .onChange set the selection list label and the onChange callback
        this.scene.gui.gui.add(this, 'selectedCamera', listValues)
        .name('Active Camera')
        .onChange((value) => {
            this.scene.camera = this.scene.graph.views[value]
            this.scene.updateProjectionMatrix();
            this.scene.loadIdentity();
            this.scene.applyViewMatrix();
            this.scene.gui.setActiveCamera(this.scene.graph.views[value])
        // do something with item
        });

        return null
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        var folder = this.scene.gui.gui.addFolder('Lights');
        // Add items to the folder, set name, bind on change to a function ‘method2’ in scene
        for(let i = 0; i < Object.keys(this.lights).length; i++){
            //this.scene.lights[i].setVisible(true)
            //this.scene.lights[i].update()
            folder.add((this.scene.lights)[0], 'enabled')
            .name(Object.keys(this.lights)[i])
        }
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;
        //List of textures
        this.textures = {}
        for (var i = 0; i < children.length; i++) {
            var textureID = this.reader.getString(children[i], 'id');
            //Verificar que de facto a textura tem um id
            if (textureID == null) {
                return "no ID defined for texture";
            }
            //Verificar que o id e unico
            if (this.textures[textureID] != null) {
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";
            }
            var textureURL = this.reader.getString(children[i], 'file');
            if (textureURL == null) {
                return "no ID defined for texture";
            }
            var texture = new CGFtexture(this.scene, textureURL);
            this.textures[textureID] = texture;
        }


        //For each texture in textures block, check ID and file URL
        //To do: Check if texture files exist.
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        /*
        materials   <-- node
            material   <-- children
                emission   <-- grandchildren
                ambient
                diffuse
                specular
            material
                emission
                ambient
                diffuse
                specular
        */
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        var grandChildren = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            //Continue here

            grandChildren = children[i].children;

            var newMaterial = new CGFappearance(this.scene);
            var materialShininess = this.reader.getFloat(children[i], 'shininess');
            if (materialShininess == null) {
                this.onXMLMinorError("No shininess defined for material " + materialID + ". Assuming shininess = 10.0");
                materialShininess = 10.0;
            }
        
            newMaterial.setShininess(materialShininess);
            var childNames = [];

            for (var j = 0; j < grandChildren.length; j++) {
                childNames.push(grandChildren[j].nodeName);
            }
            //Getting emission
            var r = 0; var g = 0; var b = 0; var a = 1;
            if (childNames.indexOf('emission') == null) {
                this.onXMLMinorError("No emission defined for material " + materialID + ". Assuming emission = (0,0,0,1)");
            } else {
                r = this.reader.getFloat(children[i].children[childNames.indexOf('emission')], 'r');
                if (r == null) {
                    this.onXMLMinorError("No red value set for emission of material " + materialID + ". Assuming r = 0");
                    r = 0;
                }
                g = this.reader.getFloat(children[i].children[childNames.indexOf('emission')], 'g');
                if (g == null) {
                    this.onXMLMinorError("No green value set for emission of material " + materialID + ". Assuming g = 0");
                    g = 0;
                }
                b = this.reader.getFloat(children[i].children[childNames.indexOf('emission')], 'b');
                if (b == null) {
                    this.onXMLMinorError("No blue value set for emission of material " + materialID + ". Assuming b = 0");
                    b = 0;
                }
                a = this.reader.getFloat(children[i].children[childNames.indexOf('emission')], 'a');
                if (a == null) {
                    this.onXMLMinorError("No alpha value set for emission of material " + materialID + ". Assuming a = 1");
                    a = 1;
                }
            }
            newMaterial.setEmission(r, g, b, a);
            //Getting ambient
            r = 0.2; g = 0.2; b = 0.2; a = 1;
            if (childNames.indexOf('ambient') == null) {
                this.onXMLMinorError("No ambient defined for material " + materialID + ". Assuming ambient = (0.2,0.2,0.2,1.0)")
            } else {
                r = this.reader.getFloat(children[i].children[childNames.indexOf('ambient')], 'r');
                if (r == null) {
                    this.onXMLMinorError("No red value set for ambient of material " + materialID + ". Assuming r = 0.2");
                    r = 0.2;
                }
                g = this.reader.getFloat(children[i].children[childNames.indexOf('ambient')], 'g');
                if (g == null) {
                    this.onXMLMinorError("No green value set for ambient of material " + materialID + ". Assuming g = 0.2");
                    g = 0.2;
                }
                b = this.reader.getFloat(children[i].children[childNames.indexOf('ambient')], 'b');
                if (b == null) {
                    this.onXMLMinorError("No blue value set for ambient of material " + materialID + ". Assuming b = 0.2");
                    b = 0.2;
                }
                a = this.reader.getFloat(children[i].children[childNames.indexOf('ambient')], 'a');
                if (a == null) {
                    this.onXMLMinorError("No alpha value set for ambient of material " + materialID + ". Assuming a = 1");
                    a = 1;
                }
            }
            newMaterial.setAmbient(r, g, b, a);
            //Getting diffuse
            r = 0.5; g = 0.5; b = 0.5; a = 1;
            if (childNames.indexOf('diffuse') == null) {
                this.onXMLMinorError("No diffuse defined for material " + materialID + ". Assuming diffuse = (0.5,0.5,0.5,1.0)")
            } else {
                r = this.reader.getFloat(children[i].children[childNames.indexOf('diffuse')], 'r');
                if (r == null) {
                    this.onXMLMinorError("No red value set for diffuse of material " + materialID + ". Assuming r = 0.5");
                    r = 0.5;
                }
                g = this.reader.getFloat(children[i].children[childNames.indexOf('diffuse')], 'g');
                if (g == null) {
                    this.onXMLMinorError("No green value set for diffuse of material " + materialID + ". Assuming g = 0.5");
                    g = 0.5;
                }
                b = this.reader.getFloat(children[i].children[childNames.indexOf('diffuse')], 'b');
                if (b == null) {
                    this.onXMLMinorError("No blue value set for diffuse of material " + materialID + ". Assuming b = 0.5");
                    b = 0.5;
                }
                a = this.reader.getFloat(children[i].children[childNames.indexOf('diffuse')], 'a');
                if (a == null) {
                    this.onXMLMinorError("No alpha value set for diffuse of material " + materialID + ". Assuming a = 1");
                    a = 1;
                }
            }
            newMaterial.setDiffuse(r, g, b, a);
            //Getting specular
            r = 0.5; g = 0.5; b = 0.5; a = 1;
            if (childNames.indexOf('specular') == null) {
                this.onXMLMinorError("No specular defined for material " + materialID + ". Assuming specular = (0.5,0.5,0.5,1.0)")
            } else {
                r = this.reader.getFloat(children[i].children[childNames.indexOf('specular')], 'r');
                if (r == null) {
                    this.onXMLMinorError("No red value set for specular of material " + materialID + ". Assuming r = 0.5");
                    r = 0.5;
                }
                g = this.reader.getFloat(children[i].children[childNames.indexOf('specular')], 'g');
                if (g == null) {
                    this.onXMLMinorError("No green value set for specular of material " + materialID + ". Assuming g = 0.5");
                    g = 0.5;
                }
                b = this.reader.getFloat(children[i].children[childNames.indexOf('specular')], 'b');
                if (b == null) {
                    this.onXMLMinorError("No blue value set for specular of material " + materialID + ". Assuming b = 0.5");
                    b = 0.5;
                }
                a = this.reader.getFloat(children[i].children[childNames.indexOf('specular')], 'a');
                if (a == null) {
                    this.onXMLMinorError("No alpha value set for specular of material " + materialID + ". Assuming a = 1");
                    a = 1;
                }
            }
            newMaterial.setSpecular(r, g, b, a);
            this.materials[materialID] = newMaterial;
        }
        //this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        //Tries to extract the axis and makes sure it equals x, y or z                       
                        var axis = this.reader.getString(grandChildren[j], "axis");
                        if (axis == null) {
                            return "axis not specified in transformation " + transformationID;
                        }
                        if (axis != 'x' && axis != 'y' && axis != "z") {
                            return "invalid axis in transformation " + transformationID + " (" + axis + ")";
                        }
                        //tries to extract the angle
                        var angle = this.reader.getFloat(grandChildren[j], "angle");
                        if (angle == null) {
                            return "angle not found in transformation " + transformationID;
                        }
                        if (axis == 'x') {
                            transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle * Math.PI / 180)
                        } else if (axis == 'y') {
                            transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle * Math.PI / 180)
                        } else if (axis == 'z') {
                            transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle * Math.PI / 180)
                        }
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;

            } else if (primitiveType == 'triangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;
                // z1
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;
                // z2
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(y2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;
                // z3
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(y3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;
                var tri = new MyTriangle(this.scene, primitiveId, x1, x2, x3, y1, y2, y3, z1, z2, z3);

                this.primitives[primitiveId] = tri;
            } else if (primitiveType == 'cylinder') {
                // topRadius
                var topRadius = this.reader.getFloat(grandChildren[0], 'top');
                if (!(topRadius != null && !isNaN(topRadius)))
                    return "unable to parse topRadius of the primitive coordinates for ID = " + primitiveId;
                // bottomRadius
                var bottomRadius = this.reader.getFloat(grandChildren[0], 'base');
                if (!(bottomRadius != null && !isNaN(bottomRadius)))
                    return "unable to parse bottomRadius of the primitive coordinates for ID = " + primitiveId;
                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var cyl = new MyCylinder(this.scene, primitiveId, topRadius, bottomRadius, height, slices, stacks); 

                this.primitives[primitiveId] = cyl;

            } else if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sph = new MySphere(this.scene, primitiveId, radius, slices, stacks); // to do: check order

                this.primitives[primitiveId] = sph;
            } else if (primitiveType == 'torus') {
                // innerRadius
                var innerRadius = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(innerRadius != null && !isNaN(innerRadius)))
                    return "unable to parse innerRadius of the primitive coordinates for ID = " + primitiveId;
                // outerRadius
                var outerRadius = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outerRadius != null && !isNaN(outerRadius)))
                    return "unable to parse outerRadius of the primitive coordinates for ID = " + primitiveId;
                // innerRadius
                var innerRadius = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(innerRadius != null && !isNaN(innerRadius)))
                    return "unable to parse innerRadius of the primitive coordinates for ID = " + primitiveId;
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var tor = new MyTorus(this.scene, primitiveId, innerRadius, outerRadius, slices, loops); // to do: check order

                this.primitives[primitiveId] = tor;
            }
            else {
                return "Unknown primitive";
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";
            grandChildren = children[i].children;

            nodeNames = [];

            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            if (transformationIndex == null) {
                return "transformation not defined in component " + componentID;
            }
            var materialsIndex = nodeNames.indexOf("materials");
            if (materialsIndex == null) {
                return "materials not defined in component " + componentID;
            }
            var textureIndex = nodeNames.indexOf("texture");
            if (textureIndex == null) {
                return "texture not defined in component " + componentID;
            }
            var childrenIndex = nodeNames.indexOf("children");
            if (childrenIndex == null) {
                return "children not defined in component " + componentID;
            }


            // Transformations
            grandgrandChildren = grandChildren[transformationIndex].children;
            var transfMatrix = mat4.create();
            if (grandgrandChildren.length > 0) {
                if (grandgrandChildren[0].nodeName != "transformationref") {
                    for (var j = 0; j < grandgrandChildren.length; j++) {
                        switch (grandgrandChildren[j].nodeName) {
                            case 'translate':
                                var coordinates = this.parseCoordinates3D(grandgrandChildren[j], "invalid translate transformation for component with id" + componentID);
                                if (!Array.isArray(coordinates))
                                    return coordinates;

                                transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                                break;
                            case 'rotate':
                                //Tries to extract the axis and makes sure it equals x, y or z                       
                                var axis = this.reader.getString(grandgrandChildren[j], "axis");
                                if (axis != 'x' && axis != 'y' && axis != "z") {
                                    return "invalid axis in transformation in component " + componentID;
                                }
                                //tries to extract the angle
                                var angle = this.reader.getFloat(grandgrandChildren[j], "angle");
                                if (angle == null) {
                                    return "angle not found in transformation in component " + componentID;
                                }
                                if (axis == 'x') {
                                    transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle * Math.PI / 180)
                                } else if (axis == 'y') {
                                    transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle * Math.PI / 180)
                                } else if (axis == 'z') {
                                    transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle * Math.PI / 180)
                                }
                                break;
                            case 'scale':
                                var coordinates = this.parseCoordinates3D(grandgrandChildren[j], "Invalid scale transformation for component with id" + componentID);
                                if (!Array.isArray(coordinates))
                                    return coordinates;

                                transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                                break;
                            default:
                                return 'invalid transformation in component ' + componentID;
                        }
                    }
                } else if (grandgrandChildren[0].nodeName == "transformationref") {
                    var transfID = this.reader.getString(grandgrandChildren[0], 'id');
                    if (transfID == null) {
                        return "transformationref without id in component " + componentID;
                    }
                    transfMatrix = this.transformations[transfID];
                    if (transfMatrix == null) {
                        return "id from transformationref in component " + componentID + " does not exist"
                    }
                } else {
                    return "uknown tag in transformationref in component " + componentID;
                }
            }
            // Materials
            var materialIDs = [];
            grandgrandChildren = grandChildren[materialsIndex].children;

            for (var j = 0; j < grandgrandChildren.length; j++) {
                if (grandgrandChildren[j].nodeName != "material") {
                    return "Unknow tag, expected 'material' in component " + componentID;
                }
                var materialID = this.reader.getString(grandgrandChildren[j], 'id')
                if (materialID == null) {
                    return "couldn't find material id in component " + componentID;
                }
                if (this.materials[materialID] == null && materialID != 'inherit') {
                    return "couldn't find material correspondent to id " + materialID + " in component " + componentID;
                }
                materialIDs.push(materialID);
            }
            // Texture
            var textureArray = [];
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id');
            if (textureID == null) {
                return "no id defined for texture in component " + componentID;
            }
            if (textureID != "inherit" && textureID != "none") {
                var length_s = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                var length_t = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
            } else {
                length_s = 1;
                length_t = 1;
            }
            if (this.textures[textureID] == null && textureID != 'none' && textureID != 'inherit') {
                return "couldn't find texture correspondent to id " + textureID + " in component " + componentID;
            }
            textureArray.push(textureID);
            textureArray.push(length_s);
            textureArray.push(length_t);
            // Children
            var componentIDs = [];
            var primitiveIDs = [];
            grandgrandChildren = grandChildren[childrenIndex].children;
            for (j = 0; j < grandgrandChildren.length; j++) {
                if (grandgrandChildren[j].nodeName == "primitiveref") {
                    var primitiveID = this.reader.getString(grandgrandChildren[j], 'id')
                    if (primitiveID == null) {
                        return "couldn't find primitiveref id in component " + componentID;
                    }
                    if (this.primitives[primitiveID] == null) {
                        return "couldn't find primitive correspondent to id " + primitiveID + " in component " + componentID;
                    }
                    primitiveIDs.push(primitiveID);
                } else if (grandgrandChildren[j].nodeName == "componentref") {
                    var childComponentID = this.reader.getString(grandgrandChildren[j], 'id')
                    if (childComponentID == null) {
                        return "couldn't find componentref id in component " + componentID;
                    }
                    /*if (this.components[childComponentID] == null) {
                        return "couldn't find component correspondent to id " + childComponentID + " in component " + componentID;
                    }*/
                    componentIDs.push(childComponentID);
                }
            }
            this.nodes[componentID] = (new MyComponent(componentID, componentIDs, primitiveIDs, textureID, materialIDs, transfMatrix));
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    //To do: garantir que por exemplo uma superificie plana tem um gradiente de cor se tiver uma luz numa ponta e nao noutro
    displayScene() {
        this.scene.pushMatrix();
        this.processComponent(this.nodes[this.idRoot], null, null);
        this.scene.popMatrix();
        //To test the parsing/creation of the primitives, call the display function directly
    }
    processComponent(comp, parent_active_mat, parent_text) {
        //First define the transformation associated with current components
        this.scene.pushMatrix();
        if (comp.transformation!=null){
            this.scene.multMatrix(comp.transformation);
        }
        //Second set the materials accordingly
        var materialToSet = null
        var materialToSetName = null
        //If the root has an inherit material, a default material should be set
        if (comp.materials[comp.activeMaterial] == 'inherit' && parent_active_mat == null) {
            
            materialToSet = this.materials[Object.keys(this.materials)[0]];
            materialToSetName = Object.keys(this.materials)[0];
        //If the material is 'inherit' then inherit de material
        } else if (comp.materials[comp.activeMaterial] == 'inherit' && parent_active_mat != null) {
            materialToSet = this.materials[parent_active_mat];
            materialToSetName =parent_active_mat;
            //If the material is defined for current component, set it as active
        } else {
            materialToSet = this.materials[comp.materials[comp.activeMaterial]];
            materialToSetName = comp.materials[comp.activeMaterial];
        }
        //Thirdly set the textures accordingly
        var textureToSet = null;
        var textureToSetName = null;
        //If the root has texture as inherit, a default texture should be displayed
        if (comp.texture == 'inherit' && parent_text == null) {
            textureToSet = null
            textureToSetName = null
        //If set to inherit, the component should inherit the texture from parent
        } else if (comp.texture == 'inherit' && parent_text != null) {
            textureToSet = this.textures[parent_text];
            textureToSetName = parent_text
        } else if (comp.texture != 'none') {
            textureToSet = this.textures[comp.texture];
            textureToSetName = comp.texture
        }
        //Apply textures and materials
        materialToSet.setTexture(textureToSet);
        materialToSet.apply();
        //If texture is set to none, textureToSet remains null
        for (var i = 0; i < comp.primitives.length; i++) {
            this.primitives[comp.primitives[i]].display()
        }
        for (var i = 0; i < comp.components.length; i++) {
            //This is only true if something very wrong happens
            if (this.nodes[comp.components[i]] == undefined){
                this.onXMLError("Component child " + comp.components[i] + "not found for component " + comp.id)
            }
            this.processComponent(this.nodes[comp.components[i]],materialToSetName,textureToSetName) //comp.components[i] is the name of the node, not the node itself
            
        }
        this.scene.popMatrix();
        return null
    }
}