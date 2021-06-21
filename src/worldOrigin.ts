import { BufferGeometry, Group, Line, LineBasicMaterial, Vector3 } from "three"

export function worldOrigin(scale)
{	
    let group = new Group()
    group.add(easyLine({ points: [new Vector3(), new Vector3(scale,0,0)] }, { color: 0xff0000, linewidth: 2 } ))
    group.add(easyLine({ points: [new Vector3(), new Vector3(0,scale,0)] }, { color: 0x00ff00, linewidth: 2 } ))
    group.add(easyLine({ points: [new Vector3(), new Vector3(0,0,scale)] }, { color: 0x0000ff, linewidth: 2 } ))
    group.add(easyLine({ points: [new Vector3(), new Vector3(-scale,0,0)] }, { color: 0x550000 } ))
    group.add(easyLine({ points: [new Vector3(), new Vector3(0,-scale,0)] }, { color: 0x005500 } ))
    group.add(easyLine({ points: [new Vector3(), new Vector3(0,0,-scale)] }, { color: 0x000055 } ))
    return group
}

export function easyLine(args: { points: Vector3[], material? }, matArgs: { color: number, linewidth?: number })
{				
    return new Line( new BufferGeometry().setFromPoints( args.points ), args.material || new LineBasicMaterial(matArgs))
}