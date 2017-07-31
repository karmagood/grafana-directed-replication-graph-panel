'use strict';

System.register(['app/core/config', 'app/plugins/sdk', 'angular', './external/vis.min'], function (_export, _context) {
    "use strict";

    var config, MetricsPanelCtrl, angular, DataSet, Network, _createClass, nodes, edges, GraphCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appCoreConfig) {
            config = _appCoreConfig.default;
        }, function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_angular) {
            angular = _angular.default;
        }, function (_externalVisMin) {
            DataSet = _externalVisMin.DataSet;
            Network = _externalVisMin.Network;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            nodes = [];
            edges = [];

            _export('PanelCtrl', _export('GraphCtrl', GraphCtrl = function (_MetricsPanelCtrl) {
                _inherits(GraphCtrl, _MetricsPanelCtrl);

                function GraphCtrl($scope, $injector, $rootScope, $http) {
                    _classCallCheck(this, GraphCtrl);

                    var _this = _possibleConstructorReturn(this, (GraphCtrl.__proto__ || Object.getPrototypeOf(GraphCtrl)).call(this, $scope, $injector));

                    _this.rootScope = $rootScope;
                    _this.scope = $scope;
                    _this.timeSrv = $injector.get('timeSrv');
                    _this.templateSrv = $injector.get('templateSrv');
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));

                    nodes = new DataSet(nodes);
                    edges = new DataSet(edges);
                    var data = {
                        nodes: nodes,
                        edges: edges
                    };
                    var options = {
                        nodes: {
                            shape: 'dot',
                            color: {
                                background: "#ffd800",
                                border: "#ff6400"
                            },
                            font: {
                                color: "#fff"
                            }
                        },
                        edges: {
                            length: 400,
                            arrows: 'to',
                            color: {
                                color: '#ff6400'
                            }
                        },
                        layout: {
                            randomSeed: 528861
                        }
                    };
                    $scope.data = data;
                    $scope.options = options;
                    return _this;
                }

                _createClass(GraphCtrl, [{
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        this.series = dataList.map(this.seriesHandler.bind(this));
                        var data_edge = {
                            label: ""
                        };
                        var data_node = {};
                        console.log(this.series);
                        for (var i = 0; i < this.series.length; i++) {
                            data_edge = {
                                label: ""
                            };
                            data_node = {};
                            if (this.series[i].target.indexOf("#") != -1) {
                                var target_id = this.series[i].target.substring(1, this.series[i].target.length);
                                var query_value = this.series[i].datapoints[this.series[i].datapoints.length - 1][0];
                                data_node = {
                                    id: target_id,
                                    value: query_value,
                                    label: target_id + "\n" + query_value,
                                    updated: 1
                                };
                                if (!(target_id in nodes._data)) {
                                    nodes.add(data_node);
                                } else {
                                    nodes.update(data_node);
                                }
                            }
                            console.log(edges);
                            if (this.series[i].target.indexOf("=") != -1) {
                                if (this.series[i].target.indexOf("*") != -1) {
                                    this.series[i].target = this.series[i].target.substring(1, this.series[i].target.length);
                                    var subtraction = 0;
                                    console.log(this.series[i].datapoints[this.series[i].datapoints.length - 1][0]);
                                    if (this.series[i].target.indexOf("-") != -1) {
                                        subtraction = this.series[parseInt(this.series[i].target.split("-")[1], 10)].datapoints[this.series[i].datapoints.length - 1][0];
                                        this.series[i].target = this.series[i].target.split("-")[0];
                                        console.log(subtraction);
                                    }
                                    console.log(this.series[i].datapoints[this.series[i].datapoints.length - 1][0] - subtraction);
                                    if (this.series[i].target.indexOf("+") != -1) {
                                        this.series[i].target = this.series[i].target.substring(1, this.series[i].target.length);
                                        data_edge['label'] = edges.get(this.series[i].target).label + " / " + (this.series[i].datapoints[this.series[i].datapoints.length - 1][0] - subtraction);
                                    } else {
                                        data_edge['label'] = this.series[i].datapoints[this.series[i].datapoints.length - 1][0] - subtraction;
                                    }
                                }
                                data_edge['id'] = this.series[i].target;
                                data_edge['from'] = this.series[i].target.split("=")[0];
                                data_edge['color'] = {
                                    color: '5a910a',
                                    opacity: this.series[i].datapoints[this.series[i].datapoints.length - 1][0] / 100
                                };
                                data_edge['to'] = this.series[i].target.split("=")[1];
                                data_edge['updated'] = 1;
                                if (!(this.series[i].target in edges._data)) {
                                    edges.add(data_edge);
                                } else {
                                    edges.update(data_edge);
                                }
                            }
                        }
                        for (var node in nodes._data) {
                            if (!nodes._data[node].updated) {
                                nodes.remove({
                                    id: node
                                });
                            } else {
                                nodes._data[node].updated = !nodes._data[node].updated;
                            }
                        }
                        for (var edge in edges._data) {
                            if (!edges._data[edge].updated) {
                                edges.remove({
                                    id: edge
                                });
                            } else {
                                edges._data[edge].updated = !edges._data[edge].updated;
                            }
                        }
                    }
                }, {
                    key: 'seriesHandler',
                    value: function seriesHandler(seriesData) {
                        var series = seriesData;
                        return series;
                    }
                }]);

                return GraphCtrl;
            }(MetricsPanelCtrl)));

            _export('GraphCtrl', GraphCtrl);

            GraphCtrl.templateUrl = 'module.html';

            angular.module('grafana.directives').directive('visNetwork', function () {
                return {
                    restrict: 'EA',
                    transclude: false,
                    scope: {
                        data: '=',
                        options: '=',
                        events: '='
                    },
                    link: function link(scope, element, attr) {
                        var networkEvents = ['click', 'doubleClick', 'oncontext', 'hold', 'release', 'selectNode', 'selectEdge', 'deselectNode', 'deselectEdge', 'dragStart', 'dragging', 'dragEnd', 'hoverNode', 'blurNode', 'zoom', 'showPopup', 'hidePopup', 'startStabilizing', 'stabilizationProgress', 'stabilizationIterationsDone', 'stabilized', 'resize', 'initRedraw', 'beforeDrawing', 'afterDrawing', 'animationFinished'];

                        var network = null;

                        scope.$watch('data', function () {
                            // Sanity check
                            if (scope.data == null) {
                                return;
                            }

                            // If we've actually changed the data set, then recreate the graph
                            // We can always update the data by adding more data to the existing data set
                            if (network != null) {
                                network.destroy();
                            }

                            // Create the graph2d object
                            network = new Network(element[0], scope.data, scope.options);

                            // Attach an event handler if defined
                            angular.forEach(scope.events, function (callback, event) {
                                if (networkEvents.indexOf(String(event)) >= 0) {
                                    network.on(event, callback);
                                }
                            });

                            // onLoad callback
                            if (scope.events != null && scope.events.onload != null && angular.isFunction(scope.events.onload)) {
                                scope.events.onload(network);
                            }
                        });

                        scope.$watchCollection('options', function (options) {
                            if (network == null) {
                                return;
                            }
                            network.setOptions(options);
                        });
                    }
                };
            });
            angular.module('grafana.services').factory('VisDataSet', function () {
                'use strict';

                return function (data, options) {
                    // Create the new dataSets
                    return new DataSet(data, options);
                };
            });

            _export('PanelCtrl', GraphCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map
