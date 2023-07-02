export class MyComponent{
    constructor(id, components, primitives, texture, materials, transformation, highlightValues, animation){
        this.id = id;
        this.components = components;
        this.primitives = primitives;
        this.texture = texture;
        this.materials = materials;
        this.activeMaterial = 0;
        this.transformation = transformation;
        this.highlightValues = highlightValues; //Vector with 4 elements representing the highlight properties of the component: [red, green, blue, scale_h]. If no highlight, then equals null
        this.highlightActive = false; //Represents if the highlight behaviour is enabled or not
        this.animation = animation;
    }

    addChild(componentId) {
        this.children.push(componentId);
    }
    
    computeAnimation(){
        //If the component is not animated return null
        if (this.animation == null){
            return null;
        }
        return this.animation.getCurrentAnimationMatrix();
    }
}