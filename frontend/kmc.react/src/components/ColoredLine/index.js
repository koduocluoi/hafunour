import React from "react";

export default function ColoredLine({
    color,
    height = 5
}) {
    return (
        <hr
            style={{
                color: color,
                backgroundColor: color,
                height: height
            }}
        />
    );
}
