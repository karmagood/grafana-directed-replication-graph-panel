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

    }



GraphCtrl.templateUrl = 'module.html';



export {
    GraphCtrl as PanelCtrl
};