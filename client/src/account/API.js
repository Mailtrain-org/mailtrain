'use strict';

import React, {Component} from 'react';
import {withTranslation} from '../lib/i18n';
import {Trans} from 'react-i18next';
import {requiresAuthenticatedUser, Title, withPageHelpers} from '../lib/page'
import {withAsyncErrorHandler, withErrorHandling} from '../lib/error-handling';
import axios from '../lib/axios';
import {Button} from '../lib/bootstrap-components';
import {getUrl} from "../lib/urls";
import {withComponentMixins} from "../lib/decorator-helpers";
import styles from "./styles.scss"

@withComponentMixins([
    withTranslation,
    withErrorHandling,
    withPageHelpers,
    requiresAuthenticatedUser
])
export default class API extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessToken: null
        };
    }

    @withAsyncErrorHandler
    async loadAccessToken() {
        const response = await axios.get(getUrl('rest/access-token'));
        this.setState({
            accessToken: response.data
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.loadAccessToken();
    }

    async resetAccessToken() {
        const response = await axios.post(getUrl('rest/access-token-reset'));
        this.setState({
            accessToken: response.data
        });
    }

    render() {
        const t = this.props.t;

        const accessToken = this.state.accessToken || 'ACCESS_TOKEN';

        let accessTokenMsg;
        if (this.state.accessToken) {
            accessTokenMsg = <div>{t('personalAccessToken') + ': '}<code>{accessToken}</code></div>;
        } else {
            accessTokenMsg = <div>{t('accessTokenNotYetGenerated')}</div>;
        }

        return (
            <div className={styles.api}>
                <Title>{t('api')}</Title>

                <div className="card mb-3">
                    <div className="card-body">
                        <div className="float-right">
                            <Button label={this.state.accessToken ? t('resetAccessToken') : t('generateAccessToken')} icon="redo" className="btn-info" onClickAsync={::this.resetAccessToken} />
                        </div>
                        {accessTokenMsg}
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-body">
                        <h4 className="card-title">{t('notesAboutTheApi')}</h4>

                        <ul className="card-text">
                            <li>
                                <Trans i18nKey="apiResponseIsAJsonStructureWithErrorAnd">API response is a JSON structure with <code>error</code> and <code>data</code> properties. If the response <code>error</code> has a value set then the request failed.</Trans>
                            </li>
                            <li>
                                <Trans i18nKey="youNeedToDefineProperContentTypeWhen">You need to define proper <code>Content-Type</code> when making a request. You can either use <code>application/x-www-form-urlencoded</code> for normal form data or <code>application/json</code> for a JSON payload. Using <code>multipart/form-data</code> is not supported.</Trans>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="card mb-3">
                    <div className="card-header">
                        <b>POST /api/subscribe/:listId – {t('addSubscription')}</b>
                    </div>
                    <div className="card-body">
                        <p className="card-text">
                            {t('thisApiCallEitherInsertsANewSubscription')}
                        </p>
                    </div>
                </div>
                <h4>POST /api/subscribe/:listId – {t('addSubscription')}</h4>

                <p>
                    {t('thisApiCallEitherInsertsANewSubscription')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscribersEmailAddress')} (<em>{t('required')}</em>)</li>
                    <li><strong>FIRST_NAME</strong> – {t('subscribersFirstName')}</li>
                    <li><strong>LAST_NAME</strong> – {t('subscribersLastName')}</li>
                    <li><strong>TIMEZONE</strong> – {t('subscribersTimezoneEgEuropeTallinnPstOr')}</li>
                    <li><strong>MERGE_TAG_VALUE</strong> – {t('customFieldValueUseYesnoForOptionGroup')}</li>
                </ul>

                <p>
                    {t('additionalPostArguments')}:
                </p>

                <ul>
                    <li>
                        <strong>FORCE_SUBSCRIBE</strong> – {t('setToYesIfYouWantToMakeSureTheEmailIs')}
                        by default.
                    </li>
                    <li>
                        <strong>REQUIRE_CONFIRMATION</strong> – {t('setToYesIfYouWantToSendConfirmationEmail')}
                    </li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/subscribe/B16uVTdW?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com&amp;MERGE_CHECKBOX=yes&amp;REQUIRE_CONFIRMATION=yes'</pre>

                <h4>POST /api/unsubscribe/:listId – {t('removeSubscription')}</h4>

                <p>
                    {t('thisApiCallMarksASubscriptionAs')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscribersEmailAddress')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/unsubscribe/B16uVTdW?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com'</pre>

                <h4>POST /api/delete/:listId – {t('deleteSubscription')}</h4>

                <p>
                    {t('thisApiCallDeletesASubscription')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('subscribersEmailAddress')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/delete/B16uVTdW?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com'</pre>

                <h4>POST /api/field/:listId – {t('addNewCustomField')}</h4>

                <p>
                    {t('thisApiCallCreatesANewCustomFieldForA')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>NAME</strong> – {t('fieldName')} (<em>{t('required')}</em>)</li>
                    <li><strong>TYPE</strong> – {t('oneOfTheFollowingTypes')}
                        <ul>
                            <li><strong>text</strong> &ndash; Text</li>
                            <li><strong>website</strong> &ndash; Website</li>
                            <li><strong>longtext</strong> &ndash; Multi-line text</li>
                            <li><strong>gpg</strong> &ndash; GPG Public Key</li>
                            <li><strong>number</strong> &ndash; Number</li>
                            <li><strong>radio</strong> &ndash; Radio Buttons</li>
                            <li><strong>checkbox</strong> &ndash; Checkboxes</li>
                            <li><strong>dropdown</strong> &ndash; Drop Down</li>
                            <li><strong>date-us</strong> &ndash; Date (MM/DD/YYY)</li>
                            <li><strong>date-eur</strong> &ndash; Date (DD/MM/YYYY)</li>
                            <li><strong>birthday-us</strong> &ndash; Birthday (MM/DD)</li>
                            <li><strong>birthday-eur</strong> &ndash; Birthday (DD/MM)</li>
                            <li><strong>json</strong> &ndash; JSON value for custom rendering</li>
                            <li><strong>option</strong> &ndash; Option</li>
                        </ul>
                    </li>
                    <li><strong>GROUP</strong> – {t('ifTheTypeIsOptionThenYouAlsoNeedTo')}</li>
                    <li><strong>GROUP_TEMPLATE</strong> – {t('templateForTheGroupElementIfNotSetThen')}</li>
                    <li><strong>VISIBLE</strong> – yes/no, {t('ifNotVisibleThenTheSubscriberCanNotView')}</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/field/B16uVTdW?access_token=${accessToken}`)}' \<br/>
--data 'NAME=Birthday&amp;TYPE=birthday-us&amp;VISIBLE=yes'</pre>

                <h4>GET /api/blacklist/get – {t('getListOfBlacklistedEmails')}</h4>

                <p>
                    {t('thisApiCallGetListOfBlacklistedEmails')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}
                        <ul>
                        <li><strong>start</strong> – {t('startPosition')} (<em>{t('optionalDefault0')}</em>)</li>
                        <li><strong>limit</strong> – {t('limitEmailsCountInResponse')} (<em>{t('optionalDefault10000')}</em>)</li>
                        <li><strong>search</strong> – {t('filterByPartOfEmail')} (<em>{t('optionalDefault')}</em>)</li>
                        </ul>
                    </li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XGET '{getUrl(`api/blacklist/get?access_token=${accessToken}&limit=10&start=10&search=gmail`)}' </pre>

                <h4>POST /api/blacklist/add – {t('addEmailToBlacklist')}</h4>

                <p>
                    {t('thisApiCallEitherAddEmailsToBlacklist')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('emailAddress')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/blacklist/add?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com'</pre>

                <h4>POST /api/blacklist/delete – {t('deleteEmailFromBlacklist')}</h4>

                <p>
                    {t('thisApiCallEitherDeleteEmailsFrom')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('emailAddress')} (<em>{t('required')}</em>)</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/blacklist/delete?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com'</pre>

                <h4>GET /api/lists/:email – {t('getTheListsAUserHasSubscribedTo')}</h4>

                <p>
                    {t('retrieveTheListsThatTheUserWithEmailHas')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XGET '{getUrl(`api/lists/test@example.com?access_token=${accessToken}`)}'</pre>


                <h4>GET /api/rss/fetch/:campaignCid – {t('triggerFetchOfACampaign')}</h4>

                <p>
                    {t('forcesTheRssFeedCheckToImmediatelyCheck')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XGET '{getUrl(`api/rss/fetch/5OOnZKrp0?access_token=${accessToken}`)}'</pre>

                <h4>POST /api/templates/:templateId/send – {t('sendTransactionalEmail')}</h4>

                <p>
                    {t('sendSingleEmailByTemplateWithGiven')}
                </p>

                <p>
                    {t('Query params')}
                </p>
                <ul>
                    <li><strong>access_token</strong> – {t('yourPersonalAccessToken')}</li>
                </ul>

                <p>
                    <strong>POST</strong> {t('arguments')}
                </p>
                <ul>
                    <li><strong>EMAIL</strong> – {t('emailAddress')} (<em>{t('required')}</em>)</li>
                    <li><strong>SEND_CONFIGURATION_ID</strong> – {t('idOfConfigurationUsedToCreateMailer')}</li>
                    <li><strong>SUBJECT</strong> – {t('subject')}</li>
                    <li><strong>TAGS</strong> – {t('mapOfTemplatesubjectVariablesToReplace')}</li>
                    <li><strong>ATTACHMENTS</strong> – {t('Attachments (format as consumed by nodemailer)')}</li>
                </ul>

                <p>
                    <strong>{t('example')}</strong>
                </p>

                <pre>curl -XPOST '{getUrl(`api/templates/1/send?access_token=${accessToken}`)}' \<br/>
--data 'EMAIL=test@example.com&amp;SUBJECT=Test&amp;TAGS[FOO]=bar&amp;TAGS[TEST]=example'</pre>
            </div>
        );
    }
}
