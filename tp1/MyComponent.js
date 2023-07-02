export class MyComponent{
    constructor(id, components, primitives, texture, materials, transformation){
        this.id = id;
        this.components = components;
        this.primitives = primitives;
        this.texture = texture;
        this.materials = materials;
        this.activeMaterial = 0;
        this.transformation = transformation;
    }

    addChild(componentId) {
        this.children.push(componentId);
    }
}