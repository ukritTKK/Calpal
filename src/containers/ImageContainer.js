import React from 'react';
import {connect} from 'react-redux';
import ImageScreen from '../Components/ImageScreen';
import FoodAction from '../actions/FoodAction';
import BreakfastAction from '../actions/BreakfastAction';
import LunchAction from '../actions/LunchAction';
import DinnerAction from '../actions/DinnerAction';
import setGraphData from '../actions/setGraphData';
import setImageDownloadURLAction from '../actions/setImageDownloadURLAction'
import setMealTimeToAdd from '../actions/setMealTimeToAdd'

class ImageContainer extends React.Component{


    render(){
        return(
            <ImageScreen {...this.props}/>
        )
    }
}


function mapStateToProps(state){
    return{
        camera : state.camera,
        food : state.food,
        main : state.main,
        server : state.server
    }
}


export default connect(mapStateToProps,{
    FoodAction,
    BreakfastAction,
    LunchAction,
    DinnerAction,
    setGraphData,
    setImageDownloadURLAction,
    setMealTimeToAdd
})(ImageContainer)