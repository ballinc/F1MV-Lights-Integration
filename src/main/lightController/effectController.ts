interface Effect {
    controller: any;
    parameters: any;
}

let effect: Effect | null;

export async function addEffect(controller: any, parameters: any) {
    effect = { controller, parameters };
}

export async function removeEffect() {
    effect = null;
}

export async function runEffects() {

    if (!effect || effect == null) {
        return;
    }

    let brightness = effect.parameters.brightness;
    effect.parameters.brightness = 10;
    console.log("run effect: brightness 0");
    await effect.controller(effect.parameters);
    effect.parameters.brightness = brightness;

    setTimeout(async () => {
        console.log("run effect: brightness full");
        await effect.controller(effect.parameters);
    }, 1000);

}

setInterval(runEffects, 2000);
