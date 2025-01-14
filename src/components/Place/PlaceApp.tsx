import { Viewport } from "pixi-viewport";
import { Application } from "@pixi/app";
import { Point } from "@pixi/math";
import { RefObject } from "preact";
import { config } from "../../config";
import { PlaceManager } from "../../managers/place";
import { PlaceContainer } from "./PlaceContainer";
import { AppWebSocket } from "../../classes/AppWebSocket";
import { EventSystem } from "@pixi/events";

export class PlaceApp {
    public app: Application;
    public viewport: Viewport;
    public canvasRef: RefObject<HTMLCanvasElement>;
    public container?: PlaceContainer;

    constructor(canvasRef: RefObject<HTMLCanvasElement>) {
        const worldSize = 1000; // Idk what is this

        this.canvasRef = canvasRef;

        this.app = new Application({
            view: canvasRef.current!,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: config.defaults.colors.background,
        });

        // https://github.com/davidfig/pixi-viewport/issues/441#issuecomment-1628206981
		const events = new EventSystem(this.app.renderer);
		events.domElement = canvasRef.current!;

        this.viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: worldSize,
            events: events,
            worldHeight: worldSize,
            disableOnContextMenu: true
        });

    }

    public create(place: typeof PlaceManager) {
        this.container = new PlaceContainer(this.viewport, this.canvasRef);

        if (place.image.value === null) return

        const { size } = place.image.value;

        this.viewport
            .drag()
            .pinch()
            .wheel()
            .fit(true, size.x, size.y)
            .zoomPercent(-config.zoom.defaultLevel, true)
            .clampZoom({
                maxScale: config.zoom.maxLevel,
                // maxWidth: size.x * config.zoom.maxLevel,
                // maxHeight: size.y * config.zoom.maxLevel,
                minWidth: config.zoom.minLevelPx,
                minHeight: config.zoom.minLevelPx
            })
            .moveCenter(new Point(size.x / 2, size.y / 2))
            .on("clicked", this.container?.place.onClick.bind(this.container.place))


        this.app.stage.addChild(this.viewport);

        this.app.render()

        this.viewport.addChild(this.container);

        place.container.value = this.container

        const ws = new AppWebSocket();
        ws.connect()

        this.canvasRef.current!.style.cursor = "crosshair";

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    private onWindowResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.viewport.resize(window.innerWidth, window.innerHeight);
    }


}