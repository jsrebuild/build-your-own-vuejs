// import Vue from "../../src/instance/index";
// import Watcher from "../../src/observer/watcher";

// describe('Wathcer test', function() {
//   it('should call callback when simple data change', function() {
//   	var vm = new Vue({
//   		data:{
//   			a:2
//   		}
//   	})
//   	var cb = jasmine.createSpy('callback');
//   	var watcher = new Watcher(vm, function(){
//   		var a = vm.a
//   	}, cb)
//   	vm.a = 5;
//     expect(cb).toHaveBeenCalled();
//   });

//   it('should call callback when nest Obj data change', function() {
//   	var vm = new Vue({
//   		data:{
//   			a:{
//   				b:{
//   					c:5
//   				}
//   			}
//   		}
//   	})
//   	var cb = jasmine.createSpy('callback');
//   	var watcher = new Watcher(vm, function(){
//   		var a = vm.a.b.c
//   	}, cb)
//   	vm.a.b.c = 50;
//     expect(cb).toHaveBeenCalled();
//   });
// });