import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();

    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui
        
        this.scene.gui=this;

        this.gui = new dat.GUI();

        // list of value labels that should be presented in the list. Necessarily string values
        // example: [“perspective camera 1”, “perspective camera 2”, “ortho camera”]
        

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        console.log("Key " + event.code + " pressed")
        this.activeKeys[event.code]=true;
        var componentNames = Object.keys(this.scene.graph.nodes)
        if (event.code == 'KeyM'){
            for (var i = 0; i< componentNames.length;i++){
                if (this.scene.graph.nodes[componentNames[i]].materials.length == 1){
                    continue;
                }
                if (this.scene.graph.nodes[componentNames[i]].activeMaterial == this.scene.graph.nodes[componentNames[i]].materials.length - 1){
                    this.scene.graph.nodes[componentNames[i]].activeMaterial = 0;
                }else{
                    this.scene.graph.nodes[componentNames[i]].activeMaterial += 1;
                }console.log("Changed material of " + componentNames[i] + " to " + this.scene.graph.nodes[componentNames[i]].materials[this.scene.graph.nodes[[componentNames[i]]].activeMaterial])   
                
            }
        }
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}