import Vue from "../src/instance/index";

describe('Proxy test', function() {
  it('should proxy vm._data.a = vm.a', function() {
  	var vm = new Vue({
  		data:{
  			a:2
  		}
  	})
    expect(vm.a).toEqual(2);
  });
});