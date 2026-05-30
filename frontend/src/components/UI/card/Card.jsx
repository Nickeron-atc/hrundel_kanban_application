import React from 'react';
import classes from './Card.css';

// callbacks

const onCardClicked = () => {
    console.log('Yo man, ds iz clicked')
}

const onCardDragStarted = () => {
    console.log('Yo man, ds iz DragStarted')
}

const onCardDragEnded = () => {
    console.log('Yo man, ds iz DragStopped')
}

const Card = ({children, ...props}) => {
    return (
        <button {...props} 
            className={classes.myBtn}
            onClick = {() => onCardClicked()}

            draggable={true}
            onDragStart={() => onCardDragStarted()}
            onDragEnd={() => onCardDragEnded()}
        >
            {children}
        </button>
    );
};

export default Card;
