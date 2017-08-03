import config from 'app/core/config';
import {
    MetricsPanelCtrl
} from 'app/plugins/sdk';
import angular from 'angular';
import {
    DataSet,
    Network
} from './external/vis.min';

var nodes = [];
var edges = [];
export class GraphCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $rootScope, $http) {
        super($scope, $injector);
        this.rootScope = $rootScope;
        this.scope = $scope;
        this.timeSrv = $injector.get('timeSrv');
        this.templateSrv = $injector.get('templateSrv');
        this.events.on('data-received', this.onDataReceived.bind(this));
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
            },
            autoResize: true,
            height: '100%',
            width: '100%'
        };
        $scope.data = data;
        $scope.options = options;
    }

    onDataReceived(dataList) {
        this.series = dataList.map(this.seriesHandler.bind(this));
        var new_series = []
        var series_counter = 0
        for(var i = 0; i < this.panel.targets.length; i++){
            if(this.series[series_counter].target == this.panel.targets[i].alias){
                new_series[i] = this.series[series_counter]
                if(series_counter+1 < this.series.length){
                    series_counter++;
                }
                
            } else {
                new_series[i] = {target: "0", datapoints: [0]};
            }
        }
        this.series = new_series;
        var data_edge = {
            label: ""
        };
        var data_node = {};
        for (var i = 0; i < this.series.length; i++) {
            try {
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
                    }
                    if (!(target_id in nodes._data)) {
                        nodes.add(data_node);
                    } else {
                        nodes.update(data_node);
                    }
                }

                if (this.series[i].target.indexOf("=") != -1) {
                    if (this.series[i].target.indexOf("*") != -1) {
                        this.series[i].target = this.series[i].target.substring(1, this.series[i].target.length)
                        var subtraction = 0;

                        if (this.series[i].target.indexOf("-") != -1) {
                            subtraction = this.series[parseInt(this.series[i].target.split("-")[1], 10)].datapoints[this.series[i].datapoints.length - 1][0];
                            this.series[i].target = this.series[i].target.split("-")[0];

                        }

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
            } catch (e) {

                continue
            }

        }
        for (var node in nodes._data) {
            if (!(nodes._data[node].updated)) {
                nodes.remove({
                    id: node
                });
            } else {
                nodes._data[node].updated = !nodes._data[node].updated;
            }
        }
        for (var edge in edges._data) {
            if (!(edges._data[edge].updated)) {
                edges.remove({
                    id: edge
                });
            } else {
                edges._data[edge].updated = !edges._data[edge].updated;
            }

        }
        console.log(edges);
        console.log(nodes);
        console.log(this.panel.targets)
    }
    seriesHandler(seriesData) {
        console.log(seriesData);

        var series = seriesData;
        return series;
    }

}



GraphCtrl.templateUrl = 'module.html';

angular.module('grafana.directives')
    .directive('visNetwork', function() {
        return {
            restrict: 'EA',
            transclude: false,
            scope: {
                data: '=',
                options: '=',
                events: '='
            },
            link: function(scope, element, attr) {
                var networkEvents = [
                    'click',
                    'doubleClick',
                    'oncontext',
                    'hold',
                    'release',
                    'selectNode',
                    'selectEdge',
                    'deselectNode',
                    'deselectEdge',
                    'dragStart',
                    'dragging',
                    'dragEnd',
                    'hoverNode',
                    'blurNode',
                    'zoom',
                    'showPopup',
                    'hidePopup',
                    'startStabilizing',
                    'stabilizationProgress',
                    'stabilizationIterationsDone',
                    'stabilized',
                    'resize',
                    'initRedraw',
                    'beforeDrawing',
                    'afterDrawing',
                    'animationFinished'

                ];

                var network = null;

                scope.$watch('data', function() {
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
                    angular.forEach(scope.events, function(callback, event) {
                        if (networkEvents.indexOf(String(event)) >= 0) {
                            network.on(event, callback);
                        }
                    });

                    // onLoad callback
                    if (scope.events != null && scope.events.onload != null &&
                        angular.isFunction(scope.events.onload)) {
                        scope.events.onload(network);
                    }
                });

                scope.$watchCollection('options', function(options) {
                    if (network == null) {
                        return;
                    }
                    network.setOptions(options);
                });
            }
        };
    });
angular.module('grafana.services')
    .factory('VisDataSet', function() {
        'use strict';
        return function(data, options) {
            // Create the new dataSets
            return new DataSet(data, options);
        };
    })

export {
    GraphCtrl as PanelCtrl
};