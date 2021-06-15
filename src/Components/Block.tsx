import React, { FC } from 'react'


const Block: FC<{ id: string, name: string }> = (props) => {
    return (
        //eslint-disable-next-line 
        <div className={`block ${props.name}`} id={props.id} />
    )
}

export default Block 