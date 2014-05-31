describe('datagrid', function () {
    var element, scope, grid;

    describe("options", function () {
        var template = '<div data-ux-datagrid="items" class="datagrid" data-options="{chunks: {size:10}, async:false}" style="width:100px;height:400px;">' +
                            '<script type="template/html" data-template-name="default" data-template-item="item">' +
                                '<div class="mock-row" style="height:10px;">{{item.id}}</div>' +
                            '</script>' +
                        '</div>'
        beforeEach(function () {
            var inject = angular.injector(['ng','ux']).invoke;
            inject(function ($compile, $rootScope) {
                scope = $rootScope.$new();
                scope.items = [];
                for (var i = 0; i < 100; i += 1) {
                    scope.items.push({id: i.toString()});
                }
                element = angular.element(template);
                document.body.appendChild(element[0]);
                $compile(element)(scope);
                $rootScope.$digest();
                grid = scope.$$childHead.datagrid;
            });
        });

        afterEach(function() {
            element.remove();
            grid = null;
        });

        it("should read options from the html options attribute", function() {
            expect(grid.options.chunks.size).toBe(10);
        });
    });

    describe("simple template", function () {
        angular.module('ux').filter('myFilter1', function () {

        });
        angular.module('ux').filter('myFilter2', function () {

        });
        var grid,
            template = '<div data-ux-datagrid="items" class="datagrid" data-options="{chunks:{size:10}, async:false}" filters="myFilter1, myFilter2" style="width:100px;height:400px;">' +
                            '<script type="template/html" data-template-name="default" data-template-item="item">' +
                                '<div class="mock-row" style="height:10px;">{{item.id}}</div>' +
                            '</script>' +
                        '</div>';
        beforeEach(function () {
            var injector = angular.injector(['ng','ux']);
            injector.invoke(function ($compile, $rootScope) {
                scope = $rootScope.$new();
                scope.items = [];
                for (var i = 0; i < 100; i += 1) {
                    scope.items.push({id: i.toString()});
                }
                element = angular.element(template);
                document.body.appendChild(element[0]);
                $compile(element)(scope);
                $rootScope.$digest();
                grid = scope.$$childHead.datagrid;
            });
        });

        afterEach(function () {
            element.remove();
            grid = null;
        });

        it("should add a content div", function() {
            expect(element[0].childNodes[0].className).toBe(ux.datagrid.options.contentClass);
        });

        it("should only have one child element. So it has removed all templates", function () {
            expect(element[0].childNodes.length).toBe(1);
        });

        it("should have the right data with the right row", function() {
            var index = 10;
            var rows = angular.element(element[0].getElementsByClassName('mock-row')[index]);
            expect(rows.text()).toBe(scope.items[index].id);
        });

        it("should create 10 chunks when chunk size is 10 and there are 100 rows", function() {
            expect(element[0].childNodes[0].childNodes.length).toBe(10); // 10 chunks of 10 rows each
        });

        it("should create 10 chunks with 10 rows in each chunk if there are 100 rows", function() {
            expect(element[0].childNodes[0].childNodes[0].childNodes.length).toBe(10);
        });

        it("reset should clear the dom and rebuild it", function() {
            var content = element[0].getElementsByClassName(ux.datagrid.options.contentClass)[0];
            var firstChunk = content.childNodes[0];
            firstChunk.beforeReset = true;
            expect(firstChunk.beforeReset).toBe(true);
            grid.reset();
            content = grid.getContent()[0];
            expect(content.childNodes[0].beforeReset).toBe(undefined);
        });

        it("scrollToIndex should scroll to 40 when scrolling to index 4 at 10px height rows", function() {
            expect(grid.scrollModel.scrollToIndex(4)).toBe(40);
        });

        it("scrollToItem should scroll to the item", function () {
            expect(grid.scrollModel.scrollToItem(scope.items[5])).toBe(50);
        });

        it("getNormalizedIndex should get the index in the normalized array of the item that is passed", function () {
            var nIndex = grid.getNormalizedIndex(scope.items[10]);
            expect(grid.data[nIndex]).toBe(scope.items[10]);
        });

        it("should convert a string to an array of injections", function() {

        });
    });

    describe("grouped template", function () {

        var size = 10,
            grid,
            template = '<div data-ux-datagrid="items" class="datagrid" data-grouped="\'children\'" data-options="{chunks:{size:10}, async:false}" style="width:100px;height:400px;">' +
                            '<script type="template/html" data-template-name="group" data-template-item="item">' +
                                '<div class="mock-row" style="height:20px;">{{item.id}</div>' +
                            '</script>' +
                            '<script type="template/html" data-template-name="sub" data-template-item="item">' +
                                '<div class="mock-row" style="height:30px">{{item.id}}</div>' +
                            '</script>' +
                            '<script type="template/html" data-template-name="default" data-template-item="item">' +
                                '<div class="mock-row" style="height:40px;">{{item.id}}</div>' +
                            '</script>' +
                        '</div>';
        beforeEach(function () {
            var inject = angular.injector(['ng','ux']).invoke;
            inject(function ($compile, $rootScope) {
                var item;
                scope = $rootScope.$new();
                scope.items = [];
                for (var i = 0; i < size; i += 1) {
                    item = {
                        id: i.toString(),
                        _template: 'group',
                        children: []
                    };
                    for(var j = 0; j < size; j += 1) {
                        item.children.push({id: i + '-' + j, _template: i % 2 ? 'sub' : 'default'});
                    }
                    scope.items.push(item);
                }
                element = angular.element(template);
                document.body.appendChild(element[0]);
                $compile(element)(scope);
                $rootScope.$digest();
                grid = scope.$$childHead.datagrid;
            });
        });

        afterEach(function () {
            element.remove();
            grid = null;
        });

        it("should add a content div", function() {
            expect(element[0].childNodes[0].className).toBe(ux.datagrid.options.contentClass);
        });

        it("should only have one child element. So it has removed all templates", function () {
            expect(element[0].childNodes.length).toBe(1);
        });

        it("should have the right data with the right row", function() {
            var index = 10,
                groupIndex = Math.floor(index / size),
                rowIndex = index % size,
                item = scope.items[groupIndex].children[rowIndex],
                normalizedIndex = grid.getNormalizedIndex(item);
            var rows = angular.element(element[0].getElementsByClassName('mock-row')[normalizedIndex]);
            expect(rows.text()).toBe(scope.items[Math.floor(index / size)].children[index % size].id);
        });

        it("should create 2 chunks when chunk size is 10 and there are 100 rows", function() {
            expect(element[0].childNodes[0].childNodes.length).toBe(2); // 10 chunks of 10 rows each
        });

        it("should create 2 chunks with 10 chunks if there are 100 rows", function() {
            expect(element[0].childNodes[0].childNodes[0].childNodes.length).toBe(10);
        });

        it("should create 2 chunks with 10 chunks with 10 rows in each chunk if there are 100 rows", function() {
            expect(element[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(10);
        });

        it("reset should clear the dom and rebuild it", function() {
            var content = element[0].getElementsByClassName(ux.datagrid.options.contentClass)[0];
            var firstChunk = content.childNodes[0];
            firstChunk.beforeReset = true;
            expect(firstChunk.beforeReset).toBe(true);
            grid.reset();
            content = grid.getContent()[0];// oldContent is removing.
            expect(content.childNodes[0].beforeReset).toBe(undefined);
        });

        it("scrollToIndex should scroll to 140 when scrolling to index 4 at 40px height rows and 20px height group headers", function() {
            expect(grid.scrollModel.scrollToIndex(4)).toBe(140);
        });

        it("scrollToItem should scroll to the item", function () {
            var item = scope.items[1].children[0];
            expect(grid.scrollModel.scrollToItem(item)).toBe(440);
        });

        it("getNormalizedIndex should get the index in the normalized array of the item that is passed", function () {
            var nIndex = grid.getNormalizedIndex(scope.items[1].children[0]);
            expect(grid.data[nIndex]).toBe(scope.items[1].children[0]);
            expect(nIndex).toBe(12); // one header for each group.
        });
    });
});