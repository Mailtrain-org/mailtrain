'use strict';

import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { withPageHelpers, Title } from '../lib/page'
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import URL from 'url-parse';
import axios from '../lib/axios';
import { Button } from '../lib/bootstrap-components';

@translate()
@withPageHelpers
@withErrorHandling
export default class API extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessToken: null
        };
    }

    @withAsyncErrorHandler
    async loadAccessToken() {
        const response = await axios.get('/rest/access-token');
        this.setState('accessToken', response.data);
    }

    componentDidMount() {
        this.loadAccessToken();
    }

    async resetAccessToken() {
        const response = await axios.post('/rest/access-token-reset');
        this.setState('accessToken', response.data);
    }

    render() {
        const t = this.props.t;

        const thisUrl = new URL();
        const serviceUrl = thisUrl.origin + '/';
        const accessToken = this.state.accessToken || 'ACCESS_TOKEN';

        return (
            <div>
                <Title>{t('Sign in')}</Title>


                <div class="panel panel-default">
                    <div class="panel-body">
                        <div class="pull-right">
                            <Button label={this.state.accessToken ? t('Reset Access Token') : t('Generate Access Token')} icon="retweet" className="btn-info" onClickAsync={::this.resetAccessToken} />
                        </div>
                        { this.state.accessToken ?
                            <div>{t('Personal access token:')} <code>{accessToken}</code></div>
                          :
                            <div>{t('Access token not yet generated')}</div>
                        }
                    </div>
                </div>

                <div class="well">
                    <h3>{t('Notes about the API')}</h3>

                    <ul>
                        <li>
                            {t('API response is a JSON structure with <code>error</code> and <code>data</code> properties. If the response <code>error</code> has a value set then the request failed.')}
                        </li>
                        <li>
                            {t('You need to define proper <code>Content-Type</code> when making a request. You can either use <code>application/x-www-form-urlencoded</code> for normal form data or <code>application/json</code> for a JSON payload. Using <code>multipart/form-data</code> is not supported.')}
                        </li>
                    </ul>
                </div>

                <h3>POST /api/subscribe/:listId – {t('Add subscription')}</h3>

                <p>
                    {t('This API call either inserts a new subscription or updates existing. Fields not included are left as is, so if you update only LAST_NAME value, then FIRST_NAME is kept untouched for an existing subscription.')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscriber\'s email address')} (<em>{t('required')}</em>)</li>
                    <li><strong>FIRST_NAME</strong> – {t('subscriber\'s first name')}</li>
                    <li><strong>LAST_NAME</strong> – {t('subscriber\'s last name')}</li>
                    <li><strong>TIMEZONE</strong> – {t('subscriber\'s timezone (eg. "Europe/Tallinn", "PST" or "UTC"). If not set defaults to "UTC"')}</li>
                    <li><strong>MERGE_TAG_VALUE</strong> – {t('custom field value. Use yes/no for option group values (checkboxes, radios, drop downs)')}</li>
                </ul>

                <p>
                    {t('Additional POST arguments')}:
                </p>

                <ul>
                    <li>
                        <strong>FORCE_SUBSCRIBE</strong> – {t('set to "yes" if you want to make sure the email is marked as subscribed even if it was previously marked as unsubscribed. If the email was already unsubscribed/blocked then subscription status is not changed')}
                        by default.
                    </li>
                    <li>
                        <strong>REQUIRE_CONFIRMATION</strong> – {t('set to "yes" if you want to send confirmation email to the subscriber before actually marking as subscribed')}
                    </li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XPOST {serviceUrl}api/subscribe/B16uVTdW?access_token={accessToken} \
--data 'EMAIL=test@example.com&amp;MERGE_CHECKBOX=yes&amp;REQUIRE_CONFIRMATION=yes'</pre>

                <h3>POST /api/unsubscribe/:listId – {t('Remove subscription')}</h3>

                <p>
                    {t('This API call marks a subscription as unsubscribed')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscriber\'s email address')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XPOST {serviceUrl}api/unsubscribe/B16uVTdW?access_token={accessToken} \
--data 'EMAIL=test@example.com'</pre>

                <h3>POST /api/delete/:listId – {t('Delete subscription')}</h3>

                <p>
                    {t('This API call deletes a subscription')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscriber\'s email address')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XPOST {serviceUrl}api/delete/B16uVTdW?access_token={accessToken} \
--data 'EMAIL=test@example.com'</pre>

                <h3>GET /api/blacklist/get – {t('Get list of blacklisted emails')}</h3>

                <p>
                    {t('This API call get list of blacklisted emails.')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}
                        <li><strong>start</strong> – {t('Start position')} (<em>{t('optional, default 0')}</em>)</li>
                        <li><strong>limit</strong> – {t('limit emails count in response')} (<em>{t('optional, default 10000')}</em>)</li>
                        <li><strong>search</strong> – {t('filter by part of email')} (<em>{t('optional, default ""')}</em>)</li>
                    </li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XGET '{serviceUrl}api/blacklist/get?access_token={accessToken}&limit=10&start=10&search=gmail' </pre>

                <h3>POST /api/blacklist/add – {t('Add email to blacklist')}</h3>

                <p>
                    {t('This API call either add emails to blacklist')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('email address')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XPOST '{serviceUrl}api/blacklist/add?access_token={accessToken}' \
--data 'EMAIL=test@example.com&amp;'</pre>

                <h3>POST /api/blacklist/delete – {t('Delete email from blacklist')}</h3>

                <p>
                    {t('This API call either delete emails from blacklist')}
                </p>

                <p>
                    <strong>GET</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('your personal access token')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('email address')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('Example')}</strong>
                </p>

                <pre>curl -XPOST '{serviceUrl}api/blacklist/delete?access_token={accessToken}' \
--data 'EMAIL=test@example.com&amp;'</pre>
            </div>
        );
    }
}
