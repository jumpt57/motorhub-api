import * as Hapi from 'hapi';
import * as Sequelize from 'sequelize';

import Utils from '../utils/utils';

export default class ManufacturersController {
    private sequelize: Sequelize.Sequelize;

    constructor(server: Hapi.Server, sequelize: Sequelize.Sequelize) {
        this.sequelize = sequelize;
        server.route([
            this.allManufacturers(),
            this.getManufacturersBikesById(),
            this.getManufacturersBikesByName(),
            this.getManufacturersBikesByIdYearMinAndMax(),
            this.getManufacturersById()
        ]);
    }

    allManufacturers(): Hapi.IRouteConfiguration {
        return {
            method: 'GET',
            path: '/manufacturers',
            handler: (request: Hapi.Request, reply: Hapi.IReply) => {
                this.sequelize.model('manufacturer').findAll({
                    attributes: ['id', 'name', 'logoUrl'],
                    where: {
                        show: true
                    },
                    include: [
                        {
                            model: this.sequelize.model('bike'),
                            as: 'bikes',
                            attributes: ['id']
                        }
                    ],
                    order: [
                        ['name', 'ASC']
                    ]
                }).then(result => {
                    let dataWithNb = [];

                    for (var i = 0; i < result.length; i++) {
                        let element = (result[i] as any).dataValues;
                        var nbBikes = element.bikes.length;
                        delete element.bikes;
                        element.nbBikes = nbBikes;
                        dataWithNb.push(element);
                    }

                    if (i == result.length) {
                        reply(dataWithNb);
                    }
                });
            }
        };
    }

    getManufacturersBikesById(): Hapi.IRouteConfiguration {
        return {
            method: 'GET',
            path: '/manufacturers/id/{id}/bikes',
            handler: (request: Hapi.Request, reply: Hapi.IReply) => {
                this.sequelize.model('manufacturer').findAll({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    },
                    where: {
                        id: request.params['id']
                    },
                    include: [
                        {
                            model: this.sequelize.model('bike'),
                            as: 'bikes',
                            through: {
                                attributes: []
                            },
                            attributes: ['id', 'name', 'imagesUrl', 'year'],
                            include: [
                                {
                                    model: this.sequelize.model('category'),
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                }).then(result => {
                    reply(result);
                });
            }
        }
    }

    getManufacturersBikesByIdYearMinAndMax(): Hapi.IRouteConfiguration {
        return {
            method: 'GET',
            path: '/manufacturers/{id}/bikes/{yearMin}/{yearMax}',
            handler: (request: Hapi.Request, reply: Hapi.IReply) => {
                this.sequelize.model('manufacturer').findAll({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    },
                    where: {
                        id: request.params['id']
                    },
                    include: [
                        {
                            model: this.sequelize.model('bike'),
                            as: 'bikes',
                            through: {
                                attributes: []
                            },
                            attributes: ['id', 'name', 'imagesUrl', 'year'],
                            include: [
                                {
                                    model: this.sequelize.model('category'),
                                    attributes: ['name']
                                }
                            ],
                            where: {
                                year: {
                                    $between: [request.params['yearMin'], request.params['yearMax']]
                                }
                            }
                        }
                    ]
                }).then(data => {
                    reply(data);
                });
            }
        }
    }

    getManufacturersById(): Hapi.IRouteConfiguration {
        return {
            method: 'GET',
            path: '/manufacturers/{id}',
            handler: (request: Hapi.Request, reply: Hapi.IReply) => {
                this.sequelize.model('manufacturer').findOne({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    },
                    where: {
                        id: request.params['id']
                    }
                }).then(data => {
                    reply(data);
                });
            }
        }
    }

    getManufacturersBikesByName(): Hapi.IRouteConfiguration {
        return {
            method: 'GET',
            path: '/manufacturers/name/{name}/bikes',
            handler: (request: Hapi.Request, reply: Hapi.IReply) => {
                var name = Utils.formatManufacturerName(request.params['name']);

                this.sequelize.model('manufacturer').findAll({
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    },
                    where: {
                        name: name
                    },
                    order: [
                        [{model: this.sequelize.model('bike'), as: 'bikes'}, 'year', 'DESC']
                    ],
                    include: [
                        {
                            model: this.sequelize.model('bike'),
                            as: 'bikes',
                            through: {
                                attributes: []
                            },
                            attributes: ['id', 'name', 'imagesUrl', 'year'],
                            include: [
                                {
                                    model: this.sequelize.model('category'),
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                }).then(result => {
                    reply(result[0]);
                });
            }
        }
    }

}