
export interface PieChartProps {
    size?: number;
    ring?: number;
    borderColor?: string;
    borderWidth?: number;
    jump?: number;
    data?: PieData[];
}

export interface PieData {
    color: string;
    quantity: number;
    name?: string;
    description?: string;
}

export interface SectionData extends PieData {
    startDegrees: number;
    endDegrees: number;
}

export const PieChart = ({
    size = 400,
    ring = .3,
    borderColor = '#ffffff',
    borderWidth = 2,
    jump = 1,
    data = [

        {
            color: "yellow",
            name: "section 3",
            description: "section 3",
            quantity: 20
        },
        {
            color: "lime",
            name: "section 4",
            description: "section 4",
            quantity: 10
        },
        {
            color: "red",
            name: "section 1",
            description: "section 1",
            quantity: 15
        },
        {
            color: "blue",
            name: "section 2",
            description: "section 2",
            quantity: 20
        }
    ] }: PieChartProps) => {

    const innerOffset = (size / 2) * ring;
    const outerRadius = size / 2;
    const innerRadius = outerRadius - (outerRadius * ring);

    const padding = .07;
    const minimum = -1 * (padding * size);
    const maximum = (size * padding * 2) + size;

    const generateChart = () => {
        //const sections = data.sort((a: PieData, b: PieData) => parseFloat(b.quantity) - parseFloat(a.quantity));
        const sections = data.sort((a: PieData, b: PieData) => b.quantity - a.quantity);
        const total = sections.reduce((accumulator: number, currentValue: PieData) => accumulator + currentValue.quantity, 0);
        let currentPos = 0;

        return sections.map((pieData: PieData, index: number) => {
            const section = { ...pieData } as SectionData;
            const totalDegrees = (section.quantity / total) * 360;
            section.startDegrees = currentPos;
            section.endDegrees = currentPos + totalDegrees;
            const transform = getTransform(currentPos, totalDegrees);
            currentPos = section.endDegrees;

            return (
                <path
                    key={`pie-chunk-${index}`}
                    //onClick={() => setSelected(section)}
                    className="section quad"
                    style={{ "--qtx": `${transform[0]}%`, "--qty": `${transform[1]}%` }}
                    d={sections.length === 1 ? calculateFullCircleD() : calculateD(section)}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    fill={section.color}
                    opacity={"1"} />
            )
        });
    }

    const getTransform = (start: number, sectionTotal: number): number[] => {

        if (sectionTotal === 360) {
            return [0, 0];
        }

        const middlePoint = start + (sectionTotal / 2);

        const exceptions = {
            '90': [jump, 0],
            '180': [0, jump],
            '270': [-1 * jump, 0]
        };

        if (Object.keys(exceptions).includes(middlePoint.toString())) {
            return exceptions[middlePoint.toString()];
        }

        const quadrent = middlePoint / 90;

        const angle = (Math.ceil(quadrent) * 90) - middlePoint;
        const a = jump * Math.sin((angle * Math.PI / 180));
        const b = Math.sqrt((jump ** 2) - (a ** 2));

        if (quadrent >= 0 && quadrent < 1) {
            return [b, -1 * a];
        }

        if (quadrent >= 1 && quadrent < 2) {
            return [a, b];
        }

        if (quadrent >= 2 && quadrent < 3) {
            return [-1 * b, 1 * a];
        }

        if (quadrent >= 3 && quadrent <= 4) {
            return [-1 * a, -1 * b];
        }

        return [0, 0];
    }

    const round = (n: number): number => {
        return Math.round(n * 10) / 10;
    }

    const calculatePoint = (radius: number, angleInDegrees: number, offset: number = 0) => {
        const radians = (angleInDegrees - 90) * Math.PI / 180;

        const startX = round(radius + (radius * Math.cos(radians))) + offset;
        const startY = round(radius + (radius * Math.sin(radians))) + offset;

        const result = [startX, startY];

        return result;
    }

    const curveCommands = (inner = false) => {
        return curveCoordinates(inner).map((coordinateSet) => {
            return `C ${coordinateSet.join(" ")}`
        })
    }
    const curveCoordinates = (inner: boolean) => {
        const bezierCoefficient = 4 * (Math.sqrt(2) - 1) / 3;

        // outer curve goes counter clockwide from top right
        const circleSize = !inner ? size : size - (2 * innerOffset);
        const bezierPointOffset = (bezierCoefficient * (circleSize / 2));

        const offsetClose = (outerRadius) - bezierPointOffset;
        const offsetFar = (outerRadius) + bezierPointOffset;

        const top = inner ? innerOffset : 0;
        const left = inner ? innerOffset : 0;
        const right = inner ? size - innerOffset : size;
        const bottom = inner ? size - innerOffset : size;

        // center points on circles boarder
        const quadrentPoints = {
            top: [outerRadius, top],
            left: [left, outerRadius],
            bottom: [outerRadius, bottom],
            right: [right, outerRadius]
        }

        let curvePointSets = null;

        if (!inner) {
            curvePointSets = {
                "top-right": [[right, offsetClose], [offsetFar, top], quadrentPoints.top],
                "top-left": [[offsetClose, top], [left, offsetClose], quadrentPoints.left],
                "bottom-left": [[left, offsetFar], [offsetClose, bottom], quadrentPoints.bottom],
                "bottom-right": [[offsetFar, bottom], [right, offsetFar], quadrentPoints.right]
            }

        } else {
            curvePointSets = {
                "top-left": [[left, offsetClose], [offsetClose, top], quadrentPoints.top],
                "top-right": [[offsetFar, top], [right, offsetClose], quadrentPoints.right],
                "bottom-right": [[right, offsetFar], [offsetFar, right], quadrentPoints.bottom],
                "bottom-left": [[offsetClose, bottom], [left, offsetFar], quadrentPoints.left]
            }
        }

        const result = Object.values(curvePointSets).map((coordinates) => {
            return coordinates.flat();
        })
        return result;
    }

    const calculateFullCircleD = () => `M ${size} ${outerRadius}
        ${curveCommands()}
        Z M ${innerOffset} ${outerRadius}
        ${curveCommands(true)}
        Z`;


    const calculateD = (section: SectionData) => {
        const startPoint = calculatePoint(outerRadius, section.startDegrees);
        const endPoint = calculatePoint(outerRadius, section.endDegrees);

        let d = `M ${startPoint.join(" ")} ` +
            `A ${outerRadius} ${outerRadius} 0 0 1 ${endPoint.join(" ")} `;

        if (ring > 0) {
            const innerStartPoint = calculatePoint(innerRadius, section.endDegrees, innerOffset);
            const innerEndPoint = calculatePoint(innerRadius, section.startDegrees, innerOffset);
            d = d +
                `L ${innerStartPoint.join(" ")} ` +
                `A ${innerRadius} ${innerRadius} 0 0 0 ${innerEndPoint.join(" ")} `;
        }

        d = d + `L ${startPoint.join(" ")} ` +
            `Z`;

        return d;

    }



    return (
        <svg
            width={'100%'}
            height={'100%'}
            viewBox={`${minimum} ${minimum} ${maximum} ${maximum}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            {generateChart()}
        </svg>

    )
}