import React, {
    useState, useEffect, createElement, FC, CSSProperties, ComponentProps,
    useRef, TouchEvent
} from 'react'

interface TouchButtonProps {
    component: string
    className?: string
    onClassName?: string
    style?: CSSProperties
    action?(): void
}

function getMetrics(target: HTMLElement) {
    return target.getClientRects()[0];
}

function inside(event: any) {
    let {left, right, top, bottom} = getMetrics(event.target);
    let {clientX, clientY} = event.touches[0];
    if (left <= clientX && clientX <= right && top <= clientY && clientY <= bottom) {
        return true;
    } else {
        return false;
    }
}


const TouchButton: FC<TouchButtonProps> = ({
    children,
    component = 'span',
    className = '__touch-button',
    onClassName = '__touch-button-on',
    style,
    action,
}) => {
    const [isOn, setIsOn] = useState(false)
    const mouseDownRef = useRef<boolean>(false)
    const touchInsideRef = useRef<boolean>(false)
    useEffect(() => {
        const windowMouseUp = () => {
            mouseDownRef.current = false
        };
        if (!window.ontouchstart) {
            window.addEventListener('mouseup', windowMouseUp)
        }
        return () => {
            if (!window.ontouchstart) {
                window.removeEventListener('mouseup', windowMouseUp);
            }
        }
    }, [])
    const handlers = () => {
        if (window.ontouchstart === undefined) {
            return {
                onMouseDown: (event: any) => {
                    mouseDownRef.current = true
                    setIsOn(true)
                },
                onMouseUp: (event: any) => {
                    mouseDownRef.current = false
                    setIsOn(false)
                    action && action()
                },
                onMouseEnter: (event: any) => {
                    if (!mouseDownRef.current) return;
                    setIsOn(true)
                },
                onMouseOut: (event: any) => {
                    if (!mouseDownRef.current) return;
                    setIsOn(false)
                }
            }
        } else {
            return {
                onTouchStart: (event: TouchEvent) => {
                    touchInsideRef.current = true
                    setIsOn(true)
                    event.preventDefault();
                },
                onTouchMove: (event: TouchEvent) => {
                    if (inside(event)) {
                        touchInsideRef.current = true
                        setIsOn(true)
                    } else {
                        touchInsideRef.current = false
                        setIsOn(false)
                    }
                    event.preventDefault();
                },
                onTouchEnd: (event: TouchEvent) => {
                    if (touchInsideRef.current) {
                        action && action()
                    }
                    touchInsideRef.current = false
                    setIsOn(false)
                    event.preventDefault();
                },
                onTouchCancel: (event: TouchEvent) => {
                    touchInsideRef.current = false
                    setIsOn(false)
                    event.preventDefault();
                }
            }
        }
    }
    const props = {
        style,
        className: `${className}${isOn ? ` ${onClassName}` : ''}`,
        ...handlers()
    }
    return React.createElement(component, props as any, children);
}

export default TouchButton
