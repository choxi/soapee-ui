import React from 'react';
import Reflux from 'reflux';
import DocMeta from 'react-doc-meta';
import cx from 'classnames';
import { Link, Navigation, State } from 'react-router';

import recipeStore from 'stores/recipe';
import authStore from 'stores/auth';
import recipeComments from 'stores/recipeComments';

import recipeActions from 'actions/recipe';
import meActions from 'actions/me';

import Spinner from 'components/spinner';
import RecipeBreakdown from 'components/recipeBreakdown';
import RecipeTotals from 'components/recipeTotals';
import RecipeFattyAcids from 'components/recipeFattyAcids';
import RecipeProperties from 'components/recipeProperties';
import GoogleComments from 'components/googleComments';
import FacebookComments from 'components/facebookComments';
import BootstrapModalLink from 'components/bootstrapModalLink';
import UserAvatar from 'components/userAvatar';
import ButtonFBLike from 'components/buttonFBLike';
import ButtonGPlusLike from 'components/buttonGPlusLike';
import MarkedDisplay from 'components/markedDisplay';
import Commentable from 'components/commentable';

import SignupOrLoginToSaveRecipe from 'modals/signupOrLoginToSaveRecipe';

export default React.createClass( {

    statics: {
        willTransitionTo: function ( transition, params ) {
            recipeActions.getRecipeById( params.id );
        }
    },

    mixins: [
        State,
        Navigation,
        Reflux.connect( recipeStore, 'recipe' ),
        Reflux.connect( authStore, 'auth' ),
        Reflux.connect( recipeComments, 'comments' )
    ],

    render() {
        if ( this.state.recipe.error ) {
            return (
                <div id="recipe">
                    { this.renderError() }
                </div>
            );
        } else {
            return (
                <div id="recipe">
                    <DocMeta tags={ this.tags() } />
                    { this.renderLoading() }
                    { this.renderRecipe() }
                </div>
            );
        }
    },

    renderRecipe() {
        let recipeName;
        let recipeDescription;
        let recipeNotes;

        let notesActive;
        let commentsActive;

        if ( this.pageIsForRequestedRecipe() ) {
            recipeName = this.state.recipe.getModelValue( 'name' );
            recipeDescription = this.state.recipe.getModelValue( 'description' );
            recipeNotes = this.state.recipe.getModelValue( 'notes' );

            notesActive = recipeNotes;
            commentsActive = !notesActive;

            document.title = `Soapee - ${this.state.recipe.getModelValue( 'name' )}`;

            return (
                <div>
                    <ol className="breadcrumb">
                        <li><Link to="home">Home</Link></li>
                        <li><Link to="recipes">Recipes</Link></li>
                        <li className="active">{recipeName}</li>
                    </ol>

                    <legend><h1>{recipeName}</h1></legend>
                    { recipeDescription && <div className="description"><MarkedDisplay content={ recipeDescription } /></div> }

                    <div className="row">
                        <div className="col-sm-10">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Oils</h3>
                                </div>
                                <RecipeBreakdown
                                    recipe={ this.state.recipe }
                                    withOilLinks={true}
                                    />
                            </div>
                        </div>

                        <div className="col-sm-1 text-center hidden-xs">
                            <UserAvatar
                                user={ this.state.recipe.getModelValue( 'user' ) }
                                />
                            { this.state.recipe.isPrivate() &&
                                <div className="private">
                                    <i className="fa fa-lock"></i>
                                    <div>Private <br/>Recipe</div>
                                </div>
                            }
                        </div>

                        <div className="col-sm-1 text-center hidden-xs">
                            <div className="social">
                                <ButtonFBLike
                                    url={ window.location }
                                    />
                                <ButtonGPlusLike
                                    url={ window.location }
                                    />
                            </div>
                        </div>

                        <div className="col-sm-6">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Total Weights</h3>
                                </div>
                                <RecipeTotals
                                    recipe={ this.state.recipe }
                                    />
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Recipe Properties</h3>
                                </div>
                                <RecipeProperties
                                    recipe={ this.state.recipe }
                                    withRange={true}
                                    />
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Fatty Acids</h3>
                                </div>
                                <RecipeFattyAcids
                                    recipe={ this.state.recipe }
                                    />
                            </div>
                        </div>
                    </div>

                    <legend></legend>
                    { this.renderActionButtons() }

                    <div>
                        <ul className="nav nav-tabs" role="tablist">
                            { recipeNotes && <li role="presentation" className={ cx( { active: notesActive } ) }><a href="#notes" aria-controls="notes" role="tab" data-toggle="tab">Recipe Notes and Directions</a></li> }
                            <li role="presentation" className={ cx( { active: commentsActive } ) }><a href="#comments" aria-controls="comments" role="tab" data-toggle="tab">User Comments {this.countComments()}</a></li>
                            <li role="presentation"><a href="#facebook" aria-controls="facebook" role="tab" data-toggle="tab">Facebook Comments</a></li>
                            <li role="presentation"><a href="#google" aria-controls="google" role="tab" data-toggle="tab">Google+ Comments</a></li>
                        </ul>
                        <div className="tab-content">
                            { recipeNotes &&
                                <div role="tabpanel" className={ cx( 'tab-pane', { active: notesActive } )  } id="notes">
                                    <MarkedDisplay content={ recipeNotes } />
                                </div>
                            }
                            <div role="tabpanel" className={ cx( 'tab-pane', { active: commentsActive } )  } id="comments">
                                <Commentable
                                    store={ recipeComments }
                                    />
                            </div>
                            <div role="tabpanel" className="tab-pane" id="facebook">
                                <FacebookComments
                                    url={ window.location }
                                    />
                            </div>
                            <div role="tabpanel" className="tab-pane" id="google">
                                <GoogleComments
                                    url={ window.location }
                                    />
                            </div>
                        </div>
                    </div>

                </div>
            );
        }
    },

    countComments() {
        let count = recipeComments.count();

        if ( count ) {
            return <span>({ count })</span>;
        }
    },

    renderLoading() {
        if ( !(this.pageIsForRequestedRecipe()) ) {
            return <Spinner />;
        }
    },

    renderActionButtons() {
        let printButton;
        let editButton;
        let addToFavouritesButton;

        printButton = <Link to="printRecipe" params={ { id: this.getParams().id } } className="btn btn-primary"><i className="fa fa-print"></i> Print Recipe</Link>;
        editButton = <Link to="editRecipe" params={ { id: this.getParams().id } } className="btn btn-primary"><i className="fa fa-pencil-square-o"></i> Edit Recipe</Link>;

        if ( authStore.isAuthenticated() ) {
            if ( !(authStore.isMyId( this.state.recipe.getModelValue( 'user_id' ) ) ) ) {
                addToFavouritesButton = <button className="btn btn-primary" onClick={ this.addToFavourites }><i className="fa fa-star"></i> Add to Favourites</button>;
                editButton = <Link to="editRecipe" params={ { id: this.getParams().id } } className="btn btn-primary"><i className="fa fa-pencil-square-o"></i> Copy and Edit Recipe</Link>;
            }
        } else {
            addToFavouritesButton = (
                <BootstrapModalLink
                    elementToClick={<button className="btn btn-primary"><i className="fa fa-star"></i> Add to Favourites</button>}
                    modal={SignupOrLoginToSaveRecipe}
                    action="add recipe to favourites"
                    />
            );

        }

        return (
            <div className="btn-toolbar">
                { printButton }
                { editButton }
                { addToFavouritesButton }
            </div>
        );
    },

    addToFavourites() {
        function success() {
            $.bootstrapGrowl( 'Recipe Added to your Favourites', { type: 'warning', delay: 5000 } );
        }

        meActions.addRecipeToFavourites( this.state.recipe.recipe )
            .then( success );
    },

    pageIsForRequestedRecipe() {
        let requested = Number( this.getParams().id );
        let got = Number( this.state.recipe.getModelValue( 'id' ) );

        return requested === got;
    },

    renderError() {
        let error = this.state.recipe.error;
        let message;

        if ( error.errorType === 'NotAuthorisedError' ) {
            message = (
                <div className="error">
                    <h2>Private Recipe</h2>
                    <p>This recipe has been marked as private and can only be viewed by the owner.</p>
                    <p>Please <Link to="login">login</Link> to view this recipe if your are its author.</p>
                </div>
            );
        } else {
            message = (
                <div className="error">
                    <h2>Unexpected Error</h2>
                    <p>Oh dear! Not sure what happened there.</p>
                    <p>
                        I would be most grateful if you would report this error to either the
                        <a href="https://www.reddit.com/r/soapee/" target="_blank">Reddit</a> support group or to our
                        page on <a href="https://www.facebook.com/soapeepage" target="_blank">Facebook</a>.
                    </p>
                </div>
            );
        }

        return message;
    },

    tags() {
        let description = `Soapee Recipe - ${this.state.recipe.getModelValue( 'name' )}`;

        return [
            {name: 'description', content: description},
            {name: 'twitter:card', content: description},
            {name: 'twitter:title', content: description},
            {property: 'og:title', content: description}
        ];
    }


} );