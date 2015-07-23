import React from 'react/addons';
import Reflux from 'reflux';
import cx from 'classnames';
import TextArea from 'react-textarea-autosize';

import formLinkHandlers from 'mixins/formLinkHandlers';
import ValidateProfileForm from 'services/validateProfileForm';

import meStore from 'stores/me';
import meActions from 'actions/me';

import UserAvatar from 'components/userAvatar';

export default React.createClass( {

    mixins: [
        Reflux.connect( meStore, 'profile' ),
        React.addons.LinkedStateMixin,
        formLinkHandlers
    ],

    getInitialState() {
        return {
            errors: {}
        };
    },

    componentDidMount() {
        meActions.getMyProfile();
    },

    render() {
        let  nameClasses = cx( 'form-group', {
            'has-error': this.state.errors.name
        } );

        return (
            <div id="profile">
                <div className="jumbotron">
                    <h1>My Profile</h1>
                </div>

                <div className="jumbotron clearfix">
                    <form className="form-horizontal" onSubmit={ (e) => e.preventDefault() }>
                        <div className="col-sm-11">
                            <div className={nameClasses}  >
                                <legend>My Name</legend>
                                <input type="text"
                                       className="form-control"
                                       valueLink={ this.linkStore( meStore, 'name' ) }
                                    />

                                { this.state.errors.name &&
                                    <span className="label label-danger animate bounceIn">{ this.state.errors.name[ 0 ]}</span>
                                }
                            </div>
                        </div>

                        <div className="col-sm-1">
                            <div className="thumbnail">
                                <UserAvatar
                                    user={ this.state.profile }
                                    />
                            </div>
                        </div>

                        <div className="col-sm-12">
                            <div className="form-group">
                                <legend>About Me</legend>
                                <TextArea
                                    className="input-description"
                                    useCacheForDOMMeasurements
                                    valueLink={ this.linkStore( meStore, 'about' ) }
                                    />
                                </div>
                        </div>

                        <div className="col-sm-12">
                            <div className="form-group">
                                <div className="btn-toolbar action-buttons">
                                    <button className="btn btn-primary" onClick={ this.updateProfile }>Update Profile</button>
                                </div>
                            </div>
                        </div>
                    </form>

                </div>

            </div>
        );
    },

    updateProfile() {
        function validateForm() {
            return new ValidateProfileForm( {
                name: this.state.profile.name
            } )
                .execute();
        }

        function save() {
            return meActions.updateMyProfile( {
                name: this.state.profile.name,
                about: this.state.profile.about
            } );
        }

        function setErrors( e ) {
            if ( e.name === 'CheckitError' ) {
                this.setState( {
                    errors: e.toJSON()
                } );
            }
        }

        this.setState( {
            errors: {}
        } );

        validateForm.call( this )
            .then( save.bind( this ) )
            .catch( setErrors.bind( this ) );
    }

} );
