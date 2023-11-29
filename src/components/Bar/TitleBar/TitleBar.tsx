import { useContext, useEffect, useState } from "preact/hooks";
import { Param } from "../../General/Param/Param";
import styles from "./TitleBar.module.css";
import { InfoContext } from "../../../managers/info";
import { PlaceContext } from "../../../managers/place";
import { effect, useSignal } from "@preact/signals";
import { config } from "../../../config";

export function TitleBar() {
    const info = useContext(InfoContext)
    const place = useContext(PlaceContext)
    const [infoIntervalId, setInfoIntervalId] = useState<NodeJS.Timeout>()

    useEffect(() => {
        info.fetch();

        setInfoIntervalId(setInterval(info.fetch, config.time.update.info))
    }, [])


    const isFinished = info.info.value.ended

    const name = info.info.value.name === "season:blank" ? "Без названия" : info.info.value.name
    const icon = isFinished ? "🏁" : "⚔️"

    return (
        <details className={styles.wrapper}>
            <summary className={styles.title}>{name} {icon}</summary>
            <div className={styles.content}>
                <Param label="Кулдаун" value={info.info.value.cooldown + "мс"} />
                <Param label="Размер" value={place.image.value?.size?.x + "x" + place.image.value?.size?.y} />
                <Param label="Игроков" value={info.info.value.players?.online + "/" + info.info.value.players?.total} />
            </div>
        </details>
    )
}