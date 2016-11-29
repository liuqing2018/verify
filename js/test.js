/**
 * Created by tudou on 2016/11/29.
 */
function Test (name){
    this.name = name;
}
Test.prototype.showName = function () {
    console.log(this)
    console.log(this.name);
};

var newTest = new Test('leo');
var newTest2 = new Test('blue');
newTest.showName();
newTest2.showName();
newTest.showName();
