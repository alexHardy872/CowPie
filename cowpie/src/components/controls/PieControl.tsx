import { PieChart } from "./PieChart";
import { useState, useEffect } from 'react';

export const PieControll = () => {

    const [ring, setRing] = useState(30);
    const [jump, setJump] = useState(1);
    const [border, setBorder] = useState('#ffffff');
    const [borderWidth, setBorderWidth] = useState(2);
    const [size, setSize] = useState(500);
    const [count, setCount] = useState(1);
    const [data, setData] = useState(() => [{
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        quantity: 1
    }]);

    useEffect(() => {
        const res = [];
        for (let i = 0; i < count; i++) {
            res.push({
                color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'),
                quantity: 1
            })
        }
        setData(res);
    }, [count]);

    const fields = [
        {
            label: 'size',
            render: () => (
                <input onChange={(e) => setSize(e.target.value)} type={'range'} step={10} min={100} max={600} value={size} />
            )
        },
        {
            label: 'ring',
            render: () => (
                <input onChange={(e) => setRing(e.target.value)} type={'range'} step={5} min={5} max={100} value={ring} />
            )
        },
        {
            label: 'jump',
            render: () => (
                <input onChange={(e) => setJump(e.target.value)} type={'range'} step={1} min={0} max={5} value={jump} />
            )
        },
        {
            label: 'border-color',
            render: () => (
                <input onChange={(e) => setBorder(e.target.value)} type="color" value={border} />
            )
        },
        {
            label: 'border-width',
            render: () => (
                <input onChange={(e) => setBorderWidth(e.target.value)} type={'range'} step={1} min={0} max={5} value={borderWidth} />
            )
        },
        {
            label: 'count',
            render: () => (
                <input onChange={(e) => setCount(e.target.value)} type={'range'} step={1} min={1} max={25} value={count} />
            )
        }

    ]

    return (
        <>
            {fields.map((field, index) => (
                <div key={index} className={'form-field'}>
                    {`${field.label}: `}
                    {field.render()}
                </div>
            ))}

            <div style={{ backgroundColor: 'black', textAlign: 'center', width: `${size}px`, height: `${size}px` }}>
                <PieChart
                    data={data}
                    ring={ring / 100}
                    jump={jump}
                    borderColor={border}
                    borderWidth={borderWidth} />
            </div>

        </>

    )
}