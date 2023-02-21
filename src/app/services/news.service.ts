import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Article, NewsResponse, ArticlesByCategoryAndPage } from '../Interfaces';
import { map } from 'rxjs/operators';

const apiKey = environment.apiKey;
const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private articleByCategoryAndPage: ArticlesByCategoryAndPage = {}

  constructor( private http: HttpClient ) { }

  private executeQuery<T>( endponit: string ){
    console.log('Peticion Http realizada');
    this.http.get(`${ apiUrl }${ endponit }`, {
      params:{ 
        apiKey  : apiKey,
        country : 'us'
      }
    }).subscribe(clientes => console.log('array', clientes));

    return this.http.get<T>(`${ apiUrl }${ endponit }`, {
      params:{ 
        apiKey  : apiKey,
        country : 'us'
      }
    })

    
  }

  getTopHeadlines(): Observable<Article[]> {

    return this.getTopHeadlinesByCategory('business');

    // return this.executeQuery<NewsResponse>(`/top-headlines?category=business`).pipe(
    //   // map(resp => resp.articles)
    //   map(({ articles }) => articles)
    // );
  }

  getTopHeadlinesByCategory( category: string, loadMore: boolean = false ):Observable<Article[]>{

    if( loadMore ){
      this.getArticlesByCategory(category);
    }

    if( this.articleByCategoryAndPage[category] ){
      return of(this.articleByCategoryAndPage[category].articles);
    }

    return this.getArticlesByCategory(category);
    
  }

  private getArticlesByCategory( category: string): Observable<Article[]>{

    if( Object.keys( this.articleByCategoryAndPage ).includes(category) ){
      // Ya existe
      // this.articleByCategoryAndPage[category].page += 1;
    }else{
      console.log('No existe');
      this.articleByCategoryAndPage[category] = {
        page: 0,
        articles: []
      }
    }

    console.log('pagina', this.articleByCategoryAndPage[category].page + 1);
    const page = this.articleByCategoryAndPage[category].page + 1 ;

    return this.executeQuery<NewsResponse>(`/top-headlines?category=${category}&page=${page}`)
    .pipe(
      map( ( { articles } ) => {
        console.log('example1');
        console.log(articles.length);
        console.log('example2');

        if( articles.length === 0 ) return this.articleByCategoryAndPage[category].articles;


        this.articleByCategoryAndPage[category] = {
          page: page,
          articles: [
            ...this.articleByCategoryAndPage[category].articles, ...articles
          ]
        } 
        
        return this.articleByCategoryAndPage[category].articles;
      } ) 
    );

  }
  
}
