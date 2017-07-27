import config from 'app/core/config';
import {
    MetricsPanelCtrl
} from 'app/plugins/sdk';
import angular from 'angular';
import {
    DataSet, Network
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