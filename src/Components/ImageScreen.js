import React from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TouchableHighlight
} from 'react-native';
import {
    ShareDialog
} from 'react-native-fbsdk';
import firebase from 'react-native-firebase';
import ModalWrapper from 'react-native-modal-wrapper';
import {
    TextField
} from 'react-native-material-textfield';
import {
    RaisedTextButton
} from 'react-native-material-buttons';
import UUIDGenerator from 'react-native-uuid-generator';
import {
    NavigationActions
} from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';


const styles = StyleSheet.create({
    container : {
        flex : 1,
        flexDirection : 'column',
    },
    boximage : {
        flex : 1
    },
    boxcontent : {
        flex : 2,
        backgroundColor : '#f4f9f9',
    },
    boxtext : {
        height : 60,
        backgroundColor : 'white',
        justifyContent : 'center',
        alignItems : 'center',
        
    },
    circle : {
        width : 60,
        height : 60,
        borderRadius : 60/2,
        backgroundColor : '#4267b2',
        alignItems : 'center',
        justifyContent : 'center'
    }

})


const resetAction = NavigationActions.reset({
    index : 0,
    actions : [
        NavigationActions.navigate({
            routeName : 'Photo',
        })
    ]
})

const hour = new Date().getHours().toString()
const date = new Date().getDate().toString();
const tempmonth = new Date().getMonth()+1;
const month = tempmonth.toString();
const year = new Date().getFullYear().toString();
const day = date+'-'+month+'-'+year;





export default class ImageScreen extends React.Component{

    constructor(props){
        super(props)
        this.state = ({
            name : null,
            calories : null,
            isModalVisiable : false,
            namenewfood : null,
            random : null,
            sumcal : 0,
            urlimage : null,
        })
    }


    componentWillMount(){
        UUIDGenerator.getRandomUUID().then((uuid) => {
            this.setState({
                random : uuid
            })
        })
    }


    componentDidMount(){

        //read sumcal from database
        firebase.database().goOnline();
        let userId = firebase.auth().currentUser.uid
        let ref = firebase.database().ref('users/' + userId);
        let self = this;
        let food = ref.child('food').orderByKey().child(day)
        food.once('value',function(data){
            if(data.val() != null){
                if( data.val().sumcal != 'undefined'){
                    self.setState({
                        sumcal : data.val().sumcal
                    })
                }
            }
        });

        
        //url to share
        let refstorage = firebase.storage().ref(userId+"/temp.jpg");
        refstorage.getDownloadURL()
        .then((url) => {
            self.setState({
                urlimage : url
            })
            console.log("url",url)
        },function(error){
            console.log(error)
        });

    }



    shareLinkWithShareDialog() {
        let shareLinkContent = {
            contentType: 'link',
            contentUrl: this.state.urlimage,
            contentDescription: 'This image for Application Calpal',
        }
         
        var tmp = this;
        ShareDialog.canShow(shareLinkContent).then(
          function(canShow) {
            if (canShow) {
              return ShareDialog.show(shareLinkContent);
            }
          }
        ).then(
          function(result) {
            if (result.isCancelled) {
              console.log('share cancelled')
            } else {
              console.log('Share success with postId: '+ result.postId);
            }
          },
          function(error) {
            console.log('Share fail with error: ' + error);
          }
        );
      }


    _toggleModal(){
        this.setState({
            isModalVisiable : !this.state.isModalVisiable
        })
    }



    OthersaveToStorageFirebase(){
        let imagePath = this.props.camera.image_food
        let ref = firebase.storage().ref(this.state.namenewfood).child(this.state.random)
        console.log(ref.fullPath)
        let uploadTask = ref.putFile(imagePath, {contentType : 'image/jpeg'});
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
            
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log(`Upload is ${progress}% done`);
          
            switch (snapshot.state) {
                case firebase.storage.TaskState.SUCCESS: // or 'success'
                    // console.log('Upload is complete');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    // console.log('Upload is running');
                    break;
                default:
                    console.log(snapshot.state);
            }
        }, (error) => {
            console.error(error);
        }, () => {
            const uploadTaskSnapshot = uploadTask.snapshot;
        });
    }


    NormalSaveToStorageFirebase(name, namefood, cal){
        let userId = firebase.auth().currentUser.uid;
        let imagePath = this.props.camera.image_food
        let ref = firebase.storage().ref(userId).child(day).child(name).child(this.state.random);

        //save to firebase
        let user = firebase.database().ref('users/' + userId);
        let fndate = user.child('food').child(day).child(name)
        let newlist = fndate.push()
        console.log('cal ', cal)
        console.log('namefood ', namefood)
        newlist.set({
            'cal' : cal,
            'namefood' : namefood,
            'pathimage' : ref.fullPath
        })


        //log upload
        const uploadTask = ref.putFile(imagePath, {contentType : 'image/jpeg'});
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
            
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log(`Upload is ${progress}% done`);
          
            switch (snapshot.state) {
                case firebase.storage.TaskState.SUCCESS: // or 'success'
                    console.log('Upload is complete');
                    this.props.setImageDownloadURLAction()
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    break;
                default:
                    console.log(snapshot.state);
            }
        }, (error) => {
            console.error(error);
        }, () => {
            const uploadTaskSnapshot = uploadTask.snapshot;
        });
    }



    render(){
        const iconshare = <Icon name = 'share-alt' style = {{color : 'white'}} size = {25}/>
        var boxnamefood = [];
        for(let i = 0 ; i < 4 ; i++){
            boxnamefood.push(
                <TouchableOpacity key = {i} onPress = {() => {
                    let self = this
                    firebase.database().goOnline();
                    let userId = firebase.auth().currentUser.uid;
                    let user = firebase.database().ref('users/' + userId);
                    let food = user.child('food');
                    let fndate = food.child(day);
                    if (this.props.main.Selected_Meal_Time == 'breakfast') {
                        this.NormalSaveToStorageFirebase('breakfast',this.props.server.data_server[i],this.props.server.calories[i])
                    }
                    else if (this.props.main.Selected_Meal_Time == 'lunch') {
                        this.NormalSaveToStorageFirebase('lunch',this.props.server.data_server[i],this.props.server.calories[i])
                    }
                    else if (this.props.main.Selected_Meal_Time == 'dinner') {
                        this.NormalSaveToStorageFirebase('dinner',this.props.server.data_server[i],this.props.server.calories[i])
                    }
                    else if (this.props.main.Selected_Meal_Time == '') {
                        if(hour >= 5 && hour <= 10){
                            this.NormalSaveToStorageFirebase('breakfast',this.props.server.data_server[i],this.props.server.calories[i])
                        }
                        else if(hour >= 11 && hour <= 15){
                            this.NormalSaveToStorageFirebase('lunch',this.props.server.data_server[i],this.props.server.calories[i])
                        }
                        else{
                            this.NormalSaveToStorageFirebase('dinner',this.props.server.data_server[i],this.props.server.calories[i])
                        }
                    }
                    this.props.setMealTimeToAdd('')
                    this.props.navigation.dispatch(resetAction)
                    this.props.navigation.navigate("Main");
                    let allcal = this.state.sumcal + this.props.server.calories[i]
                    let temp = {
                        "sumcal" : allcal
                    }
                    fndate.update(temp)
                    // this.props.setGraphData();

                }}>
                    <View style = {styles.boxtext}>
                        <View style = {{flex: 0.98, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', padding: 5}}>
                            <Text>{this.props.server.data_server[i]} : {this.props.server.calories[i]} kilocalories</Text>
                        </View>
                        <View style = {{flex: 0.02, width: '100%', backgroundColor: '#ededed', alignSelf: 'center'}}></View>
                    </View>
                </TouchableOpacity>
            )
        }


        return(
            <View style = {styles.container}>
                <View style = {styles.boximage}>
                    <Image
                        source = {{
                            isStatic: true,
                            uri : this.props.camera.image_food
                        }}
                        style = {{
                            height : '100%',
                            width : '100%'
                        }}
                    />
                </View>





                <View style = {styles.boxcontent}>
                    <Text style={{ color: '#0094ff', fontWeight: 'bold', padding: 10}}>
                        Please select your food
                    </Text>
                    {boxnamefood}
                    <TouchableOpacity onPress = {() => {
                        this._toggleModal();
                        
                        
                    }}>
                    <ModalWrapper visible = {this.state.isModalVisiable} style = {{width : 280, height : 180, paddingLeft : 24, paddingRight : 24}}>
                        <TextField
                            autoFocus = {true}
                            label = 'Input your Food Name'
                            placeholder = "Name Food..."
                            onChangeText = {(text)=>{
                                console.log(text);
                                this.setState({
                                    namenewfood : text
                                })
                            }}
                        />
                        <View style = {{flex : 1,flexDirection : 'row',justifyContent : 'flex-end',alignItems : 'center'}}>
                            <RaisedTextButton
                                rippleDuration = {400} 
                                rippleOpacity={0.54} 
                                color='#0094ff' 
                                title = "Next" 
                                titleColor = "white"
                                onPress = {()=>{
                                    this._toggleModal();
                                    this.OthersaveToStorageFirebase();
                                }}
                            />
                            <RaisedTextButton
                                rippleDuration = {400} 
                                rippleOpacity={0.54} 
                                color='#0094ff' 
                                title = "Cancle" 
                                titleColor = "white"
                                onPress = {()=>{
                                    this._toggleModal();
                                }}
                            />
                        </View>
                    </ModalWrapper>
                        <View style = {styles.boxtext}>
                            <Text style = {{fontSize : 13}}>
                                <Text>Other...</Text>
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View style = {{position : 'absolute', right : 20,bottom : 20}}>
                        <TouchableOpacity onPress={this.shareLinkWithShareDialog.bind(this)}>
                            <View style = {styles.circle}>
                                {iconshare}
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        );
    }
}