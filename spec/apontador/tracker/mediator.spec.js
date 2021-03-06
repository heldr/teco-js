/*global require, describe, it, beforeEach, afterEach, jQuery, sinon, expect*/
require(
    ['apontador/tracker/mediator', 'jquery'],
    function (mediator) {
        'use strict';

        describe('Tracker Mediator', function () {
            var stubSubscriber;

            beforeEach(function () {
                jQuery('body').append('<div class="target" data-foo="bar" data-baz="loren ipsum"></div>');
                jQuery('body').append('<span class="target" style="visibility: hidden;" data-foo="bar2" data-baz="loren ipsum"><span class="specific_target"></span></span>');
                stubSubscriber = sinon.spy();
            });

            afterEach(function () {
                jQuery('.target').remove();
                stubSubscriber = null;
                mediator.clear();
            });

            it('should track an element view when found at the page', function () {
                mediator.assign([
                    {
                        name: 'event name',
                        selector: '.target',
                        on: ['view']
                    }
                ]).toSubscribers([
                    stubSubscriber
                ]).track();

                expect(stubSubscriber.callCount).to.eql(1);
            });

            it('should call subscribers with event type, name and attributes', function () {
                mediator.assign([
                    {
                        name: 'event name',
                        selector: '.target',
                        on: ['view', 'click']
                    }
                ]).toSubscribers([
                    stubSubscriber
                ]).track();

                jQuery('.specific_target').trigger('click');

                expect(stubSubscriber.callCount).to.eql(2); // one view and one click
                expect(
                    stubSubscriber.getCall(1).args
                ).to.be.eql([
                    'click',
                    'event name',
                    {
                        'foo': 'bar2',
                        'baz': 'loren ipsum'
                    }
                ]);
            });

            it('should throw an exception triyng to start tracking without subscribers', function () {
                mediator.assign([
                    {
                        name: 'event name',
                        selector: '.target',
                        on: ['view']
                    }
                ]);

                expect(function () {
                    mediator.track();
                }).to.throwException(function (e) {
                    expect(e).to.be.a(TypeError);
                    expect(e.message).to.eql(
                        'No subscriber found when tracking started'
                    );
                });
            });

            it('should throw an exception trying to start tracking whithout events', function () {
                mediator.toSubscribers([stubSubscriber]);

                expect(function () {
                    mediator.track();
                }).to.throwException(function (e) {
                    expect(e).to.be.a(TypeError);
                    expect(e.message).to.be.eql(
                        'No event assigned to track'
                    );
                });
            });

            it('should accept fixed notification attributes', function () {
                mediator.assign([
                    {
                        'name': 'event name',
                        'selector': '.target',
                        'on': ['view'],
                        'attributes': {extra: 'xpto'}
                    }
                ]).toSubscribers([
                    stubSubscriber
                ]).track();

                expect(
                    stubSubscriber.firstCall.args
                ).to.eql([
                    'view',
                    'event name',
                    {
                        'extra': 'xpto',
                        'foo': 'bar',
                        'baz': 'loren ipsum'
                    }
                ]);
            });
        });
    }
);
